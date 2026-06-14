# L5X Viewer

A React web application for visualizing Rockwell Automation Studio 5000 `.L5X` program files. Upload a `.L5X` export and instantly explore your PLC program structure through an interactive treeview, browse Add-On Instructions (AOI), and generate CSV cross-reference reports for FBD wiring.

## Purpose

PLC engineers working with Rockwell Automation Studio 5000 often need to understand the structure of large programs — which tasks run which programs, what routines exist, and how Add-On Instructions are wired in Function Block Diagram (FBD) routines. This tool provides a fast, browser-based way to explore that information without opening Studio 5000.

## Features

- **Program Treeview** — hierarchical view of Controller → Tasks → Programs → Routines
- **AOI Browser** — searchable list of all Add-On Instructions in the program with live text filtering and a Clear button
- **Parameter Inspector** — select any AOI to view its parameters: Name, Usage, Data Type, and Description in a color-coded table
- **Report Generator** — select an AOI, filter by parameter usage (Input/Output), choose specific parameters via a checkbox grid, and download a CSV cross-reference report showing how each parameter is wired in all FBD routines

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript |
| HTTP Client | Axios |
| Styling | Inline styles (no CSS framework dependency) |
| Dev Server | Create React App |

## Project Structure

```
l5x-viewer/
├── public/
├── src/
│   ├── components/
│   │   ├── FileUploader.tsx    # File picker, sends .L5X to the API
│   │   ├── TreeView.tsx        # Renders the program structure tree
│   │   ├── TreeNode.tsx        # Collapsible tree node component
│   │   ├── AoiList.tsx         # Searchable AOI list with filter and Clear button
│   │   ├── AoiParameters.tsx   # Parameter table for selected AOI
│   │   └── ReportPanel.tsx     # Report generator with AOI/param selection and CSV download
│   ├── types/
│   │   └── L5XTypes.ts         # TypeScript interfaces matching the API response
│   └── App.tsx                 # Main layout: left treeview + right tabbed panel
├── .env                        # API URL configuration
└── package.json
```

## Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- The [L5X Parser API](https://github.com/Switched09/L5XParserApi) running locally

### Install and Run

```bash
git clone https://github.com/<your-username>/l5x-viewer.git
cd l5x-viewer
npm install
```

Create a `.env` file in the project root (same folder as `package.json`):

```
REACT_APP_API_URL=http://localhost:5000
```

> Change `5000` to match the port shown when the backend starts.
> You can confirm it by checking `Properties/launchSettings.json` in the API project.

Start the development server:

```bash
npm start
```

The app opens automatically at `http://localhost:3000`.

## Usage

### Step 1 — Upload a File

Click **Open .L5X File** in the top bar and select a `.L5X` file exported from Studio 5000.

To export from Studio 5000: **File → Save As → L5X Individual Components**.

The filename appears in the header bar once the file is loaded successfully.

### Step 2 — Explore the Program Structure

The left pane shows the full program hierarchy as a collapsible treeview:

```
Controller: MyController
└── Tasks
    └── MainTask (CONTINUOUS)
        └── MainProgram
└── Programs
    └── MainProgram
        └── Routines
            ├── MainRoutine (RLL)
            └── FaultRoutine (RLL)
```

Click any node to expand or collapse it.

### Step 3 — AOI Browser tab

- Type in the search box to filter the AOI list in real time as you type
- Click **Clear** to restore the full list
- Click any AOI row to view its parameters in the table below
- Input parameters are highlighted in green, Output parameters in red

### Step 4 — Report Generator tab

1. **First combo box** — select the AOI to analyze
2. **Second combo box** — filter parameters by Usage: All, Input, or Output
3. **Checkbox grid** — check the parameters to include in the report
   - Use the header checkbox to select or deselect all visible rows at once
4. Click **Download CSV Report**

The CSV file downloads automatically with the filename:

```
AOI_Name_report_YYYYMMDD_HHmmss.csv
```

**CSV columns:**

| Column | Description |
|---|---|
| Program | Program containing the FBD routine |
| Routine | Routine name |
| Sheet | Sheet number within the routine |
| Addon_Type | AOI name |
| Addon_Operand | Instance tag name |
| Param_Name | Parameter selected in the grid |
| xRef_Operand | Tag wired to or from that parameter |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:5000` | Base URL of the L5X Parser API |

**Important:** After editing `.env`, stop and restart `npm start`. React reads environment variables only at startup — a hot reload is not enough.

## How It Connects to the Backend

This app requires the **L5X Parser API** to be running. Every action sends the file directly to the API — no session or login is required.

| User action | API endpoint called |
|---|---|
| Open .L5X file | `POST /api/l5x/parse` |
| Download CSV report | `POST /api/l5x/report` |

## Running Both Services Locally

You need two Command Prompt windows open at the same time:

**Window 1 — Backend:**

```bash
cd D:\01_Repo\csharp\L5XParserApi
dotnet run
```

**Window 2 — Frontend:**

```bash
cd D:\05_React_Projects\l5x-viewer
npm start
```

Keep both windows open while using the application.

## Docker Deployment

Build the production image:

```bash
docker build --build-arg REACT_APP_API_URL=http://your-server-ip:5000 -t l5x-viewer .
docker run -p 3000:80 l5x-viewer
```

The app will be served by nginx on port 3000.

For full stack deployment (frontend + backend together), use the `docker-compose.yml` file located in the parent folder of both projects:

```bash
docker-compose up -d --build
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| "Upload failed" on file open | Backend not running | Run `dotnet run` in the API project folder |
| Tree shows but report fails | Wrong API port in `.env` | Check the port `dotnet run` printed and update `.env` |
| "Network Error" in console | CORS not configured | Confirm `http://localhost:3000` is in `WithOrigins(...)` in `Program.cs` |
| `.env` changes not taking effect | React not restarted | Stop `npm start` with Ctrl+C and run it again |
| `process is not defined` in browser console | Expected behavior | Use the Network tab (F12) to verify the request URL instead |

## Related Repository

**Backend:** [L5XParserApi](https://github.com/Switched09/L5XParserApi) — ASP.NET Core Web API that parses `.L5X` files and performs FBD wire tracing for report generation.

## License

MIT
