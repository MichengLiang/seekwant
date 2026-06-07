import { HttpResponse, http } from "msw";

const MINIMAL_TTL = `@prefix aat: <https://micheng.dev/ns/asciidoc-abundant-tree#>.
@prefix rel: <https://micheng.dev/ns/asciidoc-relation#>.

<urn:doc#root> a aat:Heading;
    aat:headingLevel 0;
    aat:headline "Root";
    aat:raw "= Root\\n\\n";
    aat:containsDirectly <urn:doc#svc-a>, <urn:doc#svc-b>.

<urn:doc#svc-a> a aat:Heading;
    aat:headingLevel 1;
    aat:headline "Service A";
    aat:addressLabel "svc-a";
    aat:layer "业务";
    aat:raw "== Service A\\n\\nDoes A.\\n";
    rel:depends-on <urn:doc#svc-b>;
    aat:references <urn:doc#svc-b>;
    aat:containsDirectly <urn:doc#svc-a-sub>.

<urn:doc#svc-a-sub> a aat:Heading;
    aat:headingLevel 2;
    aat:headline "Service A Sub";
    aat:addressLabel "svc-a-sub";
    aat:raw "=== Service A Sub\\n\\nSub component.\\n".

<urn:doc#svc-b> a aat:Heading;
    aat:headingLevel 1;
    aat:headline "Service B";
    aat:addressLabel "svc-b";
    aat:layer "基础设施";
    aat:raw "== Service B\\n\\nDoes B.\\n".
`;

export const handlers = [
  http.get("*/data/:file", ({ params }) => {
    if (String(params.file).endsWith(".ttl")) {
      return new HttpResponse(MINIMAL_TTL, {
        headers: { "Content-Type": "text/turtle" },
      });
    }
    return new HttpResponse("not found", { status: 404 });
  }),
];
