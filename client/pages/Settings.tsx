import { useAuth } from "@/lib/auth";

export default function Settings() {
  const { user } = useAuth();

  if (!user) return <div className="container py-12">Please sign in to access settings.</div>;

  return (
    <main className="flex-1">
      <section className="container py-8">
        <div className="rounded-2xl border p-6 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account, organization preferences and notifications.</p>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Profile</h3>
              <div className="mt-3 text-sm">
                <div><strong>Username</strong></div>
                <div className="text-muted-foreground">{user.username}</div>
                <div className="mt-2"><strong>Organization</strong></div>
                <div className="text-muted-foreground">{user.organizationLabel ?? user.organization}</div>
                {user.organizationState && (<>
                  <div className="mt-2"><strong>State</strong></div>
                  <div className="text-muted-foreground">{user.organizationState}</div>
                </>)}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Notifications</h3>
              <div className="mt-3 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Email notifications</div>
                  <input type="checkbox" defaultChecked className="accent-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">In-app notifications</div>
                  <input type="checkbox" defaultChecked className="accent-primary" />
                </div>
                <div className="text-sm text-muted-foreground">Tip: connect Zapier or an email MCP to forward critical alerts.</div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Organization Inbox</h3>
              <div className="mt-3 text-sm space-y-2">
                <div>View incoming appeals, complaints and suggestions for your organization.</div>
                <div className="mt-3 flex gap-2">
                  <a href="/mota" className="rounded-md border px-3 py-1 text-sm">MOTA Inbox</a>
                  <a href="/ngo" className="rounded-md border px-3 py-1 text-sm">NGO Inbox</a>
                  <a href="/dashboard" className="rounded-md border px-3 py-1 text-sm">All Items</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
