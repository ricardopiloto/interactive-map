import { Route, useLocation } from "react-router-dom";
import { CampaignIndex, CampaignLayout } from "@/routes/CampaignLayout";
import { MapPage } from "@/routes/index";
import { Relations } from "@/routes/relacoes";
import { RoutePage } from "@/routes/rota";
import { Sessions } from "@/routes/sessoes";
import { Timeline } from "@/routes/cronologia";
import { Items } from "@/routes/itens";
import { Tools } from "@/routes/ferramentas";

function campaignChildren() {
  return (
    <>
      <Route index element={<CampaignIndex />} />
      <Route path="mapa" element={<MapPage />} />
      <Route path="relacoes" element={<Relations />} />
      <Route path="rota" element={<RoutePage />} />
      <Route path="sessoes" element={<Sessions />} />
      <Route path="cronologia" element={<Timeline />} />
      <Route path="linha-do-tempo" element={<Timeline />} />
      <Route path="itens" element={<Items />} />
      <Route path="ferramentas" element={<Tools />} />
    </>
  );
}

/** True when the first segment after `/c/` is a campaign id, so `/c/3/rota` is canonical rather than the old one-segment route. */
export function campaignPathIsCanonical(pathname: string) {
  return /^\/c\/\d+(?:\/|$)/.test(pathname);
}

export function useCampaignRouteElements() {
  const { pathname } = useLocation();
  if (campaignPathIsCanonical(pathname)) {
    return [
      <Route key="campaign-id" path="/c/:id" element={<CampaignLayout />}>
        <Route index element={<CampaignIndex />} />
      </Route>,
      <Route key="campaign-canonical" path="/c/:id/:slug" element={<CampaignLayout />}>
        {campaignChildren()}
      </Route>,
    ];
  }
  return (
    <Route key="campaign-compat" path="/c/:slug" element={<CampaignLayout />}>
      {campaignChildren()}
    </Route>
  );
}
