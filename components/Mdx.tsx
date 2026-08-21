import type { ComponentPropsWithoutRef } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";

const components = {
  p: (props: ComponentPropsWithoutRef<"p">) => <p className="mt-6" {...props} />,
  h2: (props: ComponentPropsWithoutRef<"h2">) => <h2 className="mt-12 font-display text-3xl" {...props} />,
  h3: (props: ComponentPropsWithoutRef<"h3">) => <h3 className="mt-8 font-ui text-xl" {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="my-10 border-l-2 border-scripture pl-6 text-xl text-scripture" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a className="underline decoration-accent/50 underline-offset-4 hover:text-accent" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => <ul className="mt-6 list-disc pl-6" {...props} />,
  ol: (props: ComponentPropsWithoutRef<"ol">) => <ol className="mt-6 list-decimal pl-6" {...props} />,
  code: (props: ComponentPropsWithoutRef<"code">) => <code className="font-mono text-[0.95em]" {...props} />,
};

export function Mdx({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} />;
}
