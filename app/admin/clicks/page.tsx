import connectMongo from "@/libs/mongoose";
import OutboundClick from "@/models/OutboundClick";

// маленький client компонент для копіювання
import CopyButton from "./CopyButton";

export const dynamic = "force-dynamic";

function toInt(v: string | undefined, def: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
}

function pct(n: number, total: number) {
  if (!total) return 0;
  return Math.round((n / total) * 100);
}

export default async function AdminClicksPage({
  searchParams,
}: {
  searchParams: { days?: string; limit?: string };
}) {
  const days = toInt(searchParams.days, 30);
  const limit = toInt(searchParams.limit, 50);

  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  await connectMongo();

  const totalClicks = await OutboundClick.countDocuments({
    createdAt: { $gte: from },
  });

  const topHosts: Array<{ _id: string; clicks: number }> =
    await OutboundClick.aggregate([
      { $match: { createdAt: { $gte: from } } },
      { $group: { _id: "$hostname", clicks: { $sum: 1 } } },
      { $sort: { clicks: -1 } },
      { $limit: 20 },
    ]);

  const topUrls: Array<{ _id: string; clicks: number }> =
    await OutboundClick.aggregate([
      { $match: { createdAt: { $gte: from } } },
      { $group: { _id: "$url", clicks: { $sum: 1 } } },
      { $sort: { clicks: -1 } },
      { $limit: 20 },
    ]);

  const recent = await OutboundClick.find(
    { createdAt: { $gte: from } },
    {
      hostname: 1,
      url: 1,
      wish_id: 1,
      wishlist_id: 1,
      createdAt: 1,
      referrer: 1,
    }
  )
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const topHost = topHosts[0]?._id ?? "—";
  const topHostClicks = topHosts[0]?.clicks ?? 0;

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="border-b bg-base-100">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="badge badge-primary badge-outline">Admin</div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Outbound clicks
                </h1>
              </div>
              <p className="text-sm text-base-content/60 mt-1">
                Analytics for /go redirects — last{" "}
                <span className="font-semibold">{days}</span> days
              </p>
            </div>

            {/* Filters */}
            <form className="flex flex-wrap items-center gap-2">
              <label className="join">
                <div className="join">
                  <a
                    className="btn btn-sm join-item btn-primary"
                    href="/admin/clicks"
                  >
                    Clicks
                  </a>
                  <a className="btn btn-sm join-item" href="/admin/links">
                    Links
                  </a>
                </div>
                <span className="btn btn-sm join-item btn-ghost pointer-events-none">
                  Days
                </span>
                <select
                  name="days"
                  defaultValue={String(days)}
                  className="select select-sm join-item select-bordered"
                >
                  <option value="7">7</option>
                  <option value="30">30</option>
                  <option value="90">90</option>
                  <option value="365">365</option>
                </select>
              </label>

              <label className="join">
                <span className="btn btn-sm join-item btn-ghost pointer-events-none">
                  Rows
                </span>
                <select
                  name="limit"
                  defaultValue={String(limit)}
                  className="select select-sm join-item select-bordered"
                >
                  <option value="50">50</option>
                  <option value="200">200</option>
                  <option value="500">500</option>
                </select>
              </label>

              <button className="btn btn-sm btn-primary" type="submit">
                Apply
              </button>

              <div className="join">
                <a className="btn btn-sm join-item" href="/admin/clicks?days=7">
                  7d
                </a>
                <a
                  className="btn btn-sm join-item"
                  href="/admin/clicks?days=30"
                >
                  30d
                </a>
                <a
                  className="btn btn-sm join-item"
                  href="/admin/clicks?days=90"
                >
                  90d
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card bg-base-100 shadow-sm border">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-base-content/60">Total clicks</p>
                  <p className="text-3xl font-bold mt-1">{totalClicks}</p>
                </div>
                <div className="badge badge-neutral badge-outline">
                  from {from.toLocaleDateString()}
                </div>
              </div>
              <div className="mt-3 text-xs text-base-content/60">
                All outbound clicks recorded by /go route
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border">
            <div className="card-body">
              <p className="text-sm text-base-content/60">Top domain</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-lg font-semibold font-mono truncate">
                  {topHost}
                </p>
                <span className="badge badge-primary">{topHostClicks}</span>
              </div>
              <progress
                className="progress progress-primary w-full mt-3"
                value={pct(topHostClicks, totalClicks)}
                max={100}
              />
              <div className="mt-2 text-xs text-base-content/60">
                {pct(topHostClicks, totalClicks)}% of all clicks
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border">
            <div className="card-body">
              <p className="text-sm text-base-content/60">Rows shown</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-3xl font-bold">{recent.length}</p>
                <span className="badge badge-outline">limit {limit}</span>
              </div>
              <div className="mt-3 text-xs text-base-content/60">
                Most recent clicks (newest first)
              </div>
            </div>
          </div>
        </div>

        {/* Top lists */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card bg-base-100 shadow-sm border">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title">Top domains</h2>
                <div className="badge badge-outline">{topHosts.length}</div>
              </div>

              <div className="overflow-x-auto mt-2">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Host</th>
                      <th className="text-right">Clicks</th>
                      <th className="text-right w-28">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topHosts.map((x, i) => {
                      const share = pct(x.clicks, totalClicks);
                      return (
                        <tr key={x._id} className="hover">
                          <td>{i + 1}</td>
                          <td className="font-mono">{x._id}</td>
                          <td className="text-right font-semibold">
                            {x.clicks}
                          </td>
                          <td className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <progress
                                className="progress progress-primary w-20"
                                value={share}
                                max={100}
                              />
                              <span className="text-xs text-base-content/60 w-8 text-right">
                                {share}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!topHosts.length && (
                      <tr>
                        <td colSpan={4} className="text-base-content/60">
                          No data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="card-title">Top URLs</h2>
                <div className="badge badge-outline">{topUrls.length}</div>
              </div>

              <div className="overflow-x-auto mt-2">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>URL</th>
                      <th className="text-right">Clicks</th>
                      <th className="text-right">Copy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUrls.map((x, i) => (
                      <tr key={x._id} className="hover">
                        <td>{i + 1}</td>
                        <td className="font-mono max-w-[26rem] truncate">
                          {x._id}
                        </td>
                        <td className="text-right font-semibold">{x.clicks}</td>
                        <td className="text-right">
                          <CopyButton text={x._id} />
                        </td>
                      </tr>
                    ))}
                    {!topUrls.length && (
                      <tr>
                        <td colSpan={4} className="text-base-content/60">
                          No data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-base-content/60 mt-3">
                URLs are stored without query params (clean & privacy-friendly).
              </p>
            </div>
          </div>
        </div>

        {/* Recent */}
        <div className="card bg-base-100 shadow-sm border">
          <div className="card-body">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="card-title">Recent clicks</h2>
              <div className="alert alert-info py-2 px-3 text-sm">
                Tip: “Top domains” показує, де реально є сенс підключати
                рефералки.
              </div>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Host</th>
                    <th>URL</th>
                    <th>Wishlist</th>
                    <th>Wish</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((c: any) => (
                    <tr key={String(c._id)} className="hover">
                      <td className="whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <span className="badge badge-outline font-mono">
                          {c.hostname}
                        </span>
                      </td>
                      <td className="font-mono max-w-[28rem] truncate">
                        {c.url}
                      </td>
                      <td className="font-mono text-xs text-base-content/70">
                        {c.wishlist_id ?? "—"}
                      </td>
                      <td className="font-mono text-xs text-base-content/70">
                        {c.wish_id ?? "—"}
                      </td>
                    </tr>
                  ))}
                  {!recent.length && (
                    <tr>
                      <td colSpan={5} className="text-base-content/60">
                        No recent clicks
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-base-content/60">
              <span className="badge badge-ghost">Filters</span>
              <span>days={days}</span>
              <span>limit={limit}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
