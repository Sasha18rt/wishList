import connectMongo from "@/libs/mongoose";
import Wishlist from "@/models/Wishlist";
import CopyButton from "./CopyButton";

export const dynamic = "force-dynamic";

function toInt(v: string | undefined, def: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
}

function boolParam(v: string | undefined) {
  return v === "1" || v === "true";
}
function safeHref(url: string) {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null; // ✅ не пустий блок
  }
}

export default async function AdminLinksPage({
  searchParams,
}: {
  searchParams: { limit?: string; distinct?: string };
}) {
  const limit = toInt(searchParams.limit, 200);
  const distinct = boolParam(searchParams.distinct);
  const WISHLIST_BASE = "https://wishlify.me/wishlist/";

  function wishlistPublicHref(wishlistId: string) {
    return `${WISHLIST_BASE}${encodeURIComponent(wishlistId)}`;
  }

  await connectMongo();

  // 1) total links (всі wishes з product_url)
  const totalRes = await Wishlist.aggregate<{ total: number }>([
    { $unwind: "$wishes" },
    { $match: { "wishes.product_url": { $type: "string", $ne: "" } } },
    { $count: "total" },
  ]);
  const totalLinks = totalRes[0]?.total ?? 0;

  // 2) unique links
  const uniqueRes = await Wishlist.aggregate<{ total: number }>([
    { $unwind: "$wishes" },
    { $match: { "wishes.product_url": { $type: "string", $ne: "" } } },
    { $group: { _id: "$wishes.product_url" } },
    { $count: "total" },
  ]);
  const uniqueLinks = uniqueRes[0]?.total ?? 0;

  // 3) top domains
  const topDomains = await Wishlist.aggregate<
    { _id: string; clicks: number }[]
  >([
    { $unwind: "$wishes" },
    { $match: { "wishes.product_url": { $type: "string", $ne: "" } } },
    {
      $addFields: {
        _url: "$wishes.product_url",
        _m: {
          $regexFind: {
            input: "$wishes.product_url",
            regex: /^https?:\/\/([^/?#]+)/,
          },
        },
      },
    },
    {
      $addFields: {
        hostname: {
          $toLower: { $arrayElemAt: ["$_m.captures", 0] },
        },
      },
    },
    { $match: { hostname: { $type: "string", $ne: "" } } },
    { $group: { _id: "$hostname", clicks: { $sum: 1 } } },
    { $sort: { clicks: -1 } },
    { $limit: 20 },
  ]);

  // 4) list links (distinct або всі)
  const list = distinct
    ? await Wishlist.aggregate<
        {
          _id: string;
          count: number;
          sample_wishlist_id: string;
          sample_wish_id: string;
        }[]
      >([
        { $unwind: "$wishes" },
        { $match: { "wishes.product_url": { $type: "string", $ne: "" } } },
        {
          $group: {
            _id: "$wishes.product_url",
            count: { $sum: 1 },
            sample_wishlist_id: { $first: { $toString: "$_id" } },
            sample_wish_id: { $first: { $toString: "$wishes._id" } },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
      ])
    : await Wishlist.aggregate<
        { product_url: string; wishlist_id: string; wish_id: string }[]
      >([
        { $unwind: "$wishes" },
        { $match: { "wishes.product_url": { $type: "string", $ne: "" } } },
        {
          $project: {
            _id: 0,
            product_url: "$wishes.product_url",
            wishlist_id: { $toString: "$_id" },
            wish_id: { $toString: "$wishes._id" },
          },
        },
        { $limit: limit },
      ]);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="border-b bg-base-100">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="badge badge-primary badge-outline">Admin</div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Wish product links
                </h1>
              </div>
              <p className="text-sm text-base-content/60 mt-1">
                All product_url extracted from wishes
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="join">
                <a className="btn btn-sm join-item" href="/admin/clicks">
                  Clicks
                </a>
                <a
                  className="btn btn-sm join-item btn-primary"
                  href="/admin/links"
                >
                  Links
                </a>
              </div>

              <form className="flex flex-wrap items-center gap-2">
                <label className="join">
                  <span className="btn btn-sm join-item btn-ghost pointer-events-none">
                    Rows
                  </span>
                  <select
                    name="limit"
                    defaultValue={String(limit)}
                    className="select select-sm join-item select-bordered"
                  >
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="500">500</option>
                    <option value="1000">1000</option>
                  </select>
                </label>

                <label className="cursor-pointer label gap-2">
                  <span className="label-text text-sm">Distinct</span>
                  <input
                    type="checkbox"
                    name="distinct"
                    value="1"
                    defaultChecked={distinct}
                    className="toggle toggle-sm"
                  />
                </label>

                <button className="btn btn-sm btn-primary" type="submit">
                  Apply
                </button>
              </form>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="card bg-base-100 border shadow-sm">
              <div className="card-body">
                <p className="text-sm text-base-content/60">Total links</p>
                <p className="text-3xl font-bold">{totalLinks}</p>
              </div>
            </div>
            <div className="card bg-base-100 border shadow-sm">
              <div className="card-body">
                <p className="text-sm text-base-content/60">Unique links</p>
                <p className="text-3xl font-bold">{uniqueLinks}</p>
              </div>
            </div>
            <div className="card bg-base-100 border shadow-sm">
              <div className="card-body">
                <p className="text-sm text-base-content/60">Top domain</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono font-semibold truncate">
                    {topDomains[0]?._id ?? "—"}
                  </p>
                  <span className="badge badge-outline">
                    {topDomains[0]?.clicks ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Top domains</h2>
              <div className="overflow-x-auto mt-2">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Host</th>
                      <th className="text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDomains.map((x, i) => (
                      <tr key={x._id} className="hover">
                        <td>{i + 1}</td>
                        <td className="font-mono">{x._id}</td>
                        <td className="text-right font-semibold">{x.clicks}</td>
                      </tr>
                    ))}
                    {!topDomains.length && (
                      <tr>
                        <td colSpan={3} className="text-base-content/60">
                          No data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-base-content/60 mt-3">
                Це “де є лінки у wishes”, не кліки. Кліки дивись у
                /admin/clicks.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 border shadow-sm">
            <div className="card-body">
              <h2 className="card-title">
                {distinct ? "Unique links" : "Links (sample)"}{" "}
                <span className="badge badge-outline">{limit}</span>
              </h2>

              <div className="overflow-x-auto mt-2">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>URL</th>
                      {distinct ? (
                        <>
                          <th className="text-right">Count</th>
                          <th className="text-right">Copy</th>
                        </>
                      ) : (
                        <>
                          <th>Wishlist</th>
                          <th>Wish</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {distinct
                      ? (list as any[]).map((x, i) => (
                          <tr key={x._id} className="hover">
                            <td>{i + 1}</td>
                            <td className="max-w-[34rem]">
                              {(() => {
                                const href = safeHref(x._id);
                                return href ? (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link link-primary font-mono truncate block"
                                    title={href}
                                  >
                                    {href}
                                  </a>
                                ) : (
                                  <span
                                    className="font-mono truncate block"
                                    title={x._id}
                                  >
                                    {x._id}
                                  </span>
                                );
                              })()}
                            </td>

                            <td className="text-right font-semibold">
                              {x.count}
                            </td>
                            <td className="text-right">
                              <CopyButton text={x._id} />
                            </td>
                          </tr>
                        ))
                      : (list as any[]).map((x, i) => (
                          <tr
                            key={`${x.wishlist_id}-${x.wish_id}-${i}`}
                            className="hover"
                          >
                            <td>{i + 1}</td>
                            <td className="max-w-[34rem]">
                              {(() => {
                                const href = safeHref(x.product_url);
                                return href ? (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link link-primary font-mono truncate block"
                                    title={href}
                                  >
                                    {href}
                                  </a>
                                ) : (
                                  <span
                                    className="font-mono truncate block"
                                    title={x.product_url}
                                  >
                                    {x.product_url}
                                  </span>
                                );
                              })()}
                            </td>

                            <td className="font-mono text-xs">
                              <a
                                href={wishlistPublicHref(x.wishlist_id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary"
                                title={`Open wishlist ${x.wishlist_id}`}
                              >
                                {x.wishlist_id}
                              </a>
                            </td>

                            <td className="font-mono text-xs text-base-content/70">
                              {x.wish_id}
                            </td>
                          </tr>
                        ))}

                    {!list.length && (
                      <tr>
                        <td
                          colSpan={distinct ? 4 : 4}
                          className="text-base-content/60"
                        >
                          No data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-base-content/60">
                <span className="badge badge-ghost">Filters</span>
                <span>limit={limit}</span>
                <span>distinct={String(distinct)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
