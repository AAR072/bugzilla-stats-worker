
# Bugzilla Summary Worker

This Cloudflare Worker fetches bug data from the Bugzilla API for a specified user, processes the data, and generates a dynamic SVG to visualize the contribution summary.

Awesome for showing off your Mozilla contributions
## Features

- Fetches bug data assigned to a specific user from the Bugzilla API.
- Normalizes the bug data for consistent handling of missing fields.
- Generates a dynamic SVG with a summary of bugs by their status (e.g., Assigned, Resolved, New).
- Returns the SVG as a response for easy embedding or use in other applications.

## Setup

### Prerequisites
- [Node.js](https://nodejs.org/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) installed globally:
  ```bash
  npm install -g wrangler
  ```
- A Cloudflare account and a registered Worker project.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-repo>/firefox-contribution-summary-worker.git
   cd firefox-contribution-summary-worker
   ```

2. Install dependencies (if any are added later).

3. Configure the `wrangler.toml` file with your Cloudflare account details:
   ```toml
   name = "firefox-contribution-summary-worker"
   type = "javascript"
   account_id = "your_account_id"
   workers_dev = true
   compatibility_date = "2024-11-27"
   ```

4. Modify the Bugzilla API `email1` query parameter in `fetchUserInfo` with your Bugzilla user email:
   ```typescript
   const url = `https://bugzilla.mozilla.org/rest/bug?query_format=advanced&emailtype1=exact&emailassigned_to1=1&email1=your-email@domain.com`;
   ```

## Usage

### Development

Start the development server locally:
```bash
wrangler dev src/index.ts
```
- Open your browser at [http://localhost:8787](http://localhost:8787) to test the Worker.

### Deployment

Deploy the Worker to Cloudflare:
```bash
wrangler deploy src/index.ts --name firefox-contribution-summary-worker
```

### API Endpoint

Once deployed, the Worker will be available at your Cloudflare Worker URL:
```
https://firefox-contribution-summary-worker.<your-subdomain>.workers.dev
```

The response will be a dynamically generated SVG summarizing bug contributions.

## Project Structure

```
src/
├── index.ts         # Main Worker script
├── types.ts         # (Optional) TypeScript types
```

### Key Functions
- **`fetchUserInfo`**: Fetches bug data for the specified user from Bugzilla.
- **`cleanBugsData`**: Normalizes the bug data for consistent processing.
- **`handleRequest`**: Handles HTTP requests and generates the SVG summary.

### Dynamic SVG

The Worker generates an SVG with:
- Bug counts by status (Assigned, Resolved, New).
- A Firefox logo for branding.

## Customization

- Modify the SVG styles, colors, or layout in the `handleRequest` function.
- Update the Bugzilla API query to fit your filtering criteria.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

