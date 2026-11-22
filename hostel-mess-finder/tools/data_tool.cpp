// data_tool.cpp  -  Validates hostels.csv + messes.csv, calculates distances
// and writes data.json for the Expo app.
//
// Build :  g++ data_tool.cpp -o data_tool -std=c++17
// Run   :  ./data_tool hostels.csv messes.csv ../app/data/data.json 18.5204 73.8567
//          (last two numbers = latitude and longitude of YOUR college)
//
// Needs json.hpp from https://github.com/nlohmann/json (single header file,
// keep it in the same folder as this file).

#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <set>
#include <cmath>
#include <cctype>
#include "json.hpp"

using namespace std;
using json = nlohmann::json;

const double PI = 3.14159265358979323846;
vector<string> errors; // every problem found is stored here

// ---------- small helper functions ----------
string trim(const string &s)
{
    size_t a = 0, b = s.size();
    while (a < b && isspace((unsigned char)s[a]))
        a++;
    while (b > a && isspace((unsigned char)s[b - 1]))
        b--;
    return s.substr(a, b - a);
}

// split "a|b|c" into {"a","b","c"}
vector<string> splitBy(const string &s, char sep)
{
    vector<string> parts;
    if (trim(s).empty())
        return parts;
    string cur;
    for (char c : s)
    {
        if (c == sep)
        {
            parts.push_back(trim(cur));
            cur.clear();
        }
        else
            cur += c;
    }
    parts.push_back(trim(cur));
    return parts;
}

// split one CSV line; handles "quoted, text" too
vector<string> splitCsvLine(const string &s)
{
    vector<string> out;
    string cur;
    bool inQuotes = false;
    for (size_t i = 0; i < s.size(); i++)
    {
        char c = s[i];
        if (inQuotes)
        {
            if (c == '"')
            {
                if (i + 1 < s.size() && s[i + 1] == '"')
                {
                    cur += '"';
                    i++;
                }
                else
                    inQuotes = false;
            }
            else
                cur += c;
        }
        else
        {
            if (c == '"')
                inQuotes = true;
            else if (c == ',')
            {
                out.push_back(trim(cur));
                cur.clear();
            }
            else if (c != '\r')
                cur += c;
        }
    }
    out.push_back(trim(cur));
    return out;
}

bool toInt(const string &s, int &out)
{
    try
    {
        size_t pos;
        out = stoi(s, &pos);
        return pos == s.size();
    }
    catch (...)
    {
        return false;
    }
}
bool toDouble(const string &s, double &out)
{
    try
    {
        size_t pos;
        out = stod(s, &pos);
        return pos == s.size();
    }
    catch (...)
    {
        return false;
    }
}

// distance between two GPS points in metres (Haversine formula)
double distanceMeters(double lat1, double lon1, double lat2, double lon2)
{
    const double R = 6371000.0;
    double dLat = (lat2 - lat1) * PI / 180.0;
    double dLon = (lon2 - lon1) * PI / 180.0;
    double a = sin(dLat / 2) * sin(dLat / 2) +
               cos(lat1 * PI / 180.0) * cos(lat2 * PI / 180.0) *
                   sin(dLon / 2) * sin(dLon / 2);
    return R * 2 * atan2(sqrt(a), sqrt(1 - a));
}

void addError(const string &file, int line, const string &msg)
{
    errors.push_back(file + " (line " + to_string(line) + "): " + msg);
}

bool isPhone(const string &p)
{
    if (p.size() != 10)
        return false;
    for (char c : p)
        if (!isdigit((unsigned char)c))
            return false;
    return true;
}

// read a CSV file; each row is stored together with its line number
struct Row
{
    int line;
    vector<string> f;
};
vector<Row> readCsv(const string &path, size_t columns)
{
    vector<Row> rows;
    ifstream in(path);
    if (!in)
    {
        errors.push_back("Cannot open file: " + path);
        return rows;
    }
    string text;
    int lineNo = 0;
    getline(in, text); // skip the header line
    lineNo++;
    while (getline(in, text))
    {
        lineNo++;
        if (trim(text).empty())
            continue;
        vector<string> f = splitCsvLine(text);
        if (f.size() != columns)
        {
            addError(path, lineNo, "expected " + to_string(columns) + " columns but found " + to_string(f.size()));
            continue;
        }
        rows.push_back({lineNo, f});
    }
    return rows;
}

// ---------- data types ----------
struct Room
{
    string room;
    int sharing, beds;
};
struct Hostel
{
    string id, name, type, phone, photo;
    int rent, total, vacant;
    double lat, lon;
    vector<string> rules;
    vector<Room> rooms;
};
struct Mess
{
    string id, name, type;
    int price, lunchStart, lunchEnd, dinnerStart, dinnerEnd;
    double lat, lon;
};

// ---------- load + validate hostels ----------
// columns: id,name,type,rent,total_beds,vacant_beds,lat,lon,phone,photo,rules,rooms
vector<Hostel> loadHostels(const string &path)
{
    vector<Hostel> list;
    set<string> ids;
    for (const Row &r : readCsv(path, 12))
    {
        Hostel h;
        int L = r.line;
        bool ok = true;
        h.id = r.f[0];
        h.name = r.f[1];
        h.type = r.f[2];
        h.phone = r.f[8];
        h.photo = r.f[9];

        if (h.id.empty())
        {
            addError(path, L, "id is empty");
            ok = false;
        }
        else if (ids.count(h.id))
        {
            addError(path, L, "duplicate id " + h.id);
            ok = false;
        }
        ids.insert(h.id);
        if (h.name.empty())
        {
            addError(path, L, "name is empty");
            ok = false;
        }
        if (h.type != "Boys" && h.type != "Girls")
        {
            addError(path, L, "type must be Boys or Girls");
            ok = false;
        }
        if (!toInt(r.f[3], h.rent) || h.rent < 500 || h.rent > 100000)
        {
            addError(path, L, "rent must be a number between 500 and 100000");
            ok = false;
        }
        if (!toInt(r.f[4], h.total) || h.total < 1)
        {
            addError(path, L, "total_beds must be 1 or more");
            ok = false;
        }
        if (!toInt(r.f[5], h.vacant) || h.vacant < 0)
        {
            addError(path, L, "vacant_beds must be 0 or more");
            ok = false;
        }
        else if (ok && h.vacant > h.total)
        {
            addError(path, L, "vacant_beds is more than total_beds");
            ok = false;
        }
        if (!toDouble(r.f[6], h.lat) || h.lat < -90 || h.lat > 90)
        {
            addError(path, L, "lat is invalid");
            ok = false;
        }
        if (!toDouble(r.f[7], h.lon) || h.lon < -180 || h.lon > 180)
        {
            addError(path, L, "lon is invalid");
            ok = false;
        }
        if (!isPhone(h.phone))
        {
            addError(path, L, "phone must be exactly 10 digits");
            ok = false;
        }

        h.rules = splitBy(r.f[10], '|');
        // rooms look like  204:3:1|108:2:1   (room : sharing : beds needed)
        int bedsNeeded = 0;
        for (const string &item : splitBy(r.f[11], '|'))
        {
            vector<string> p = splitBy(item, ':');
            Room room;
            if (p.size() != 3 || !toInt(p[1], room.sharing) || !toInt(p[2], room.beds) ||
                room.sharing < 1 || room.beds < 1 || room.beds > room.sharing)
            {
                addError(path, L, "bad room entry '" + item + "' (use room:sharing:beds)");
                ok = false;
                continue;
            }
            room.room = p[0];
            bedsNeeded += room.beds;
            h.rooms.push_back(room);
        }
        if (ok && bedsNeeded > h.vacant)
        {
            addError(path, L, "roommate beds are more than vacant_beds");
            ok = false;
        }
        if (ok)
            list.push_back(h);
    }
    return list;
}

// ---------- load + validate messes ----------
// columns: id,name,type,monthly_price,lat,lon,lunch_start,lunch_end,dinner_start,dinner_end
// (hours in 24h format, use 0,0 if a meal is not served)
vector<Mess> loadMesses(const string &path)
{
    vector<Mess> list;
    set<string> ids;
    for (const Row &r : readCsv(path, 10))
    {
        Mess m;
        int L = r.line;
        bool ok = true;
        m.id = r.f[0];
        m.name = r.f[1];
        m.type = r.f[2];

        if (m.id.empty())
        {
            addError(path, L, "id is empty");
            ok = false;
        }
        else if (ids.count(m.id))
        {
            addError(path, L, "duplicate id " + m.id);
            ok = false;
        }
        ids.insert(m.id);
        if (m.name.empty())
        {
            addError(path, L, "name is empty");
            ok = false;
        }
        if (m.type != "Veg" && m.type != "Non-veg" && m.type != "Both")
        {
            addError(path, L, "type must be Veg, Non-veg or Both");
            ok = false;
        }
        if (!toInt(r.f[3], m.price) || m.price < 500 || m.price > 20000)
        {
            addError(path, L, "monthly_price must be between 500 and 20000");
            ok = false;
        }
        if (!toDouble(r.f[4], m.lat) || m.lat < -90 || m.lat > 90)
        {
            addError(path, L, "lat is invalid");
            ok = false;
        }
        if (!toDouble(r.f[5], m.lon) || m.lon < -180 || m.lon > 180)
        {
            addError(path, L, "lon is invalid");
            ok = false;
        }

        int t[4];
        bool timesOk = true;
        for (int i = 0; i < 4; i++)
            if (!toInt(r.f[6 + i], t[i]) || t[i] < 0 || t[i] > 24)
                timesOk = false;
        if (!timesOk)
        {
            addError(path, L, "meal times must be hours between 0 and 24");
            ok = false;
        }
        else
        {
            m.lunchStart = t[0];
            m.lunchEnd = t[1];
            m.dinnerStart = t[2];
            m.dinnerEnd = t[3];
            bool lunch = !(t[0] == 0 && t[1] == 0), dinner = !(t[2] == 0 && t[3] == 0);
            if (!lunch && !dinner)
            {
                addError(path, L, "mess must serve lunch or dinner");
                ok = false;
            }
            if (lunch && t[0] >= t[1])
            {
                addError(path, L, "lunch_start must be before lunch_end");
                ok = false;
            }
            if (dinner && t[2] >= t[3])
            {
                addError(path, L, "dinner_start must be before dinner_end");
                ok = false;
            }
        }
        if (ok)
            list.push_back(m);
    }
    return list;
}

// ---------- main ----------
int main(int argc, char *argv[])
{
    string hostelFile = argc > 1 ? argv[1] : "hostels.csv";
    string messFile = argc > 2 ? argv[2] : "messes.csv";
    string outFile = argc > 3 ? argv[3] : "data.json";
    double collegeLat = 18.5204, collegeLon = 73.8567; // placeholder: change to your college
    if (argc > 5)
    {
        if (!toDouble(argv[4], collegeLat) || !toDouble(argv[5], collegeLon))
        {
            cerr << "College latitude/longitude must be numbers.\n";
            return 1;
        }
    }

    vector<Hostel> hostels = loadHostels(hostelFile);
    vector<Mess> messes = loadMesses(messFile);

    if (!errors.empty())
    {
        cerr << "Found " << errors.size() << " problem(s). data.json NOT written:\n";
        for (const string &e : errors)
            cerr << "  - " << e << "\n";
        return 1;
    }
    if (messes.empty())
    {
        cerr << "No messes found.\n";
        return 1;
    }

    json out;
    json hostelArray = json::array();
    json messArray = json::array();

    for (const Hostel &h : hostels)
    {
        // find the nearest mess to this hostel
        int best = 0;
        double bestDist = distanceMeters(h.lat, h.lon, messes[0].lat, messes[0].lon);
        for (size_t i = 1; i < messes.size(); i++)
        {
            double d = distanceMeters(h.lat, h.lon, messes[i].lat, messes[i].lon);
            if (d < bestDist)
            {
                bestDist = d;
                best = (int)i;
            }
        }
        double fromCollege = distanceMeters(h.lat, h.lon, collegeLat, collegeLon);

        json item;
        item["id"] = h.id;
        item["name"] = h.name;
        item["type"] = h.type;
        item["rent"] = h.rent;
        item["totalBeds"] = h.total;
        item["vacantBeds"] = h.vacant;
        item["distanceKm"] = round(fromCollege / 100.0) / 10.0; // 1 decimal
        item["phone"] = h.phone;
        item["photo"] = h.photo;
        item["nearestMessName"] = messes[best].name;
        item["nearestMessM"] = (int)round(bestDist);
        json rules = json::array();
        for (const string &r : h.rules)
            rules.push_back(r);
        item["rules"] = rules;
        json rooms = json::array();
        for (const Room &rm : h.rooms)
        {
            json o;
            o["room"] = rm.room;
            o["sharing"] = rm.sharing;
            o["beds"] = rm.beds;
            rooms.push_back(o);
        }
        item["rooms"] = rooms;
        hostelArray.push_back(item);
    }

    for (const Mess &m : messes)
    {
        json item;
        item["id"] = m.id;
        item["name"] = m.name;
        item["type"] = m.type;
        item["monthlyPrice"] = m.price;
        item["distanceM"] = (int)round(distanceMeters(m.lat, m.lon, collegeLat, collegeLon));
        item["lunchStart"] = m.lunchStart;
        item["lunchEnd"] = m.lunchEnd;
        item["dinnerStart"] = m.dinnerStart;
        item["dinnerEnd"] = m.dinnerEnd;
        messArray.push_back(item);
    }

    out["hostels"] = hostelArray;
    out["messes"] = messArray;

    ofstream file(outFile);
    if (!file)
    {
        cerr << "Cannot write " << outFile << "\n";
        return 1;
    }
    file << out.dump(2);
    cout << "Done! " << hostels.size() << " hostels and " << messes.size()
         << " messes written to " << outFile << "\n";
    return 0;
}