import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type CrumbItem = { label: string; href?: string };

type InfoPageProps = {
  title: string;
  subtitle?: string;
  crumbs?: CrumbItem[];
  children: ReactNode;
};

const InfoPage = ({ title, subtitle, crumbs = [], children }: InfoPageProps) => (
  <Layout>
    <div className="bg-gradient-warm paper-texture">
      <div className="container py-10 md:py-14">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Bosh sahifa</Link>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" />
              {c.href ? (
                <Link to={c.href} className="hover:text-foreground">{c.label}</Link>
              ) : (
                <span className="text-foreground">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="mt-4 font-display text-3xl font-semibold leading-tight md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </div>

    <div className="container py-10 md:py-14">
      <div className="mx-auto max-w-3xl">
        <article className="prose-custom space-y-6 rounded-3xl border border-border bg-card p-8 shadow-soft md:p-12">
          {children}
        </article>
      </div>
    </div>
  </Layout>
);

export default InfoPage;
