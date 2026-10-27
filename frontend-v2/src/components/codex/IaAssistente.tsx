import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/api/client";
import { campanhasApi, type AssistirResponse, type TipoAssistencia } from "@/api/campanhas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface IaAssistenteProps {
  slug: string;
  tipo: TipoAssistencia;
  alvoId?: number | null;
  textoAtual: string;
  campoPublico: boolean;
  onInserir: (texto: string) => void;
  aplicarDiretoSeVazio?: boolean;
  onSubstituir: (texto: string) => void;
}

type Resultado = {
  chave: string;
  resposta?: AssistirResponse;
  erro?: "limite" | "acesso" | "falha";
};

export function IaAssistente({
  slug,
  tipo,
  alvoId,
  textoAtual,
  campoPublico,
  onInserir,
  onSubstituir,
  aplicarDiretoSeVazio = false,
}: IaAssistenteProps) {
  const { t } = useTranslation("comum");
  const chave = `${slug}:${tipo}:${alvoId ?? "novo"}`;
  const atual = useRef({ chave, geracao: 0, pendente: false });
  if (atual.current.chave !== chave) {
    atual.current = { chave, geracao: atual.current.geracao + 1, pendente: false };
  }
  const [instrucao, setInstrucao] = useState("");
  const [carregando, setCarregando] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  useEffect(() => {
    setResultado(null);
    setInstrucao("");
    setCarregando(null);
  }, [chave]);

  async function sugerir() {
    if (atual.current.pendente) return;
    atual.current.pendente = true;
    const geracao = atual.current.geracao;
    setCarregando(chave);
    setResultado(null);
    try {
      const resposta = await campanhasApi.assistir(slug, {
        tipo,
        texto_atual: textoAtual,
        instrucao: instrucao.trim(),
        alvo_id: alvoId ?? null,
        campo_publico: campoPublico,
      });
      if (atual.current.chave === chave && atual.current.geracao === geracao) {
        if (
          aplicarDiretoSeVazio &&
          !textoAtual.trim() &&
          resposta.estado === "sugestao" &&
          resposta.texto != null
        ) {
          onSubstituir(resposta.texto);
        } else {
          setResultado({ chave, resposta });
        }
      }
    } catch (error) {
      if (atual.current.chave === chave && atual.current.geracao === geracao) {
        setResultado({
          chave,
          erro:
            error instanceof ApiError && error.status === 429
              ? "limite"
              : error instanceof ApiError && error.status === 403
                ? "acesso"
                : "falha",
        });
      }
    } finally {
      if (atual.current.chave === chave && atual.current.geracao === geracao) {
        atual.current.pendente = false;
        setCarregando(null);
      }
    }
  }

  async function copiar(texto: string) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(texto);
        return;
      } catch {
        // Tenta o método disponível em contextos sem permissão de clipboard.
      }
    }
    const area = document.createElement("textarea");
    area.value = texto;
    area.readOnly = true;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    try {
      area.select();
      document.execCommand?.("copy");
    } catch {
      // A cópia pode estar indisponível neste navegador.
    } finally {
      area.remove();
    }
  }

  const visivel = resultado?.chave === chave ? resultado : null;
  const sugestao = visivel?.resposta?.estado === "sugestao" ? visivel.resposta.texto : null;
  const limite = visivel?.resposta?.limite_caracteres ?? 0;
  const inserirExcede = sugestao !== null && textoAtual.length + sugestao.length > limite;
  const substituirExcede = sugestao !== null && sugestao.length > limite;

  return (
    <div className="w-full min-w-0 space-y-2">
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <Input
          className="min-w-0 flex-1"
          aria-label={t("iaAssistente.instrucao")}
          placeholder={t("iaAssistente.instrucao")}
          maxLength={5000}
          value={instrucao}
          onChange={(event) => setInstrucao(event.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          disabled={carregando === chave}
          onClick={sugerir}
        >
          {carregando === chave ? t("iaAssistente.carregando") : t("iaAssistente.sugerir")}
        </Button>
      </div>
      {visivel && (
        <div
          className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card p-3 text-card-foreground"
          aria-live="polite"
        >
          {visivel.erro && (
            <p role="alert" className="text-sm">
              {t(`iaAssistente.${visivel.erro}`)}
            </p>
          )}
          {visivel.resposta?.estado === "falha" && (
            <p role="alert" className="text-sm">
              {visivel.resposta.mensagem || t("iaAssistente.falha")}
            </p>
          )}
          {visivel.resposta?.estado === "vazio" && (
            <p className="text-sm">{visivel.resposta.mensagem || t("iaAssistente.vazio")}</p>
          )}
          {sugestao !== null && (
            <div className="space-y-3">
              <p className="text-sm font-medium">{t("iaAssistente.revisao")}</p>
              <pre className="max-w-full whitespace-pre-wrap break-words font-sans text-sm">
                {sugestao}
              </pre>
              {visivel.resposta?.truncado && (
                <p className="text-sm text-muted-foreground">{t("iaAssistente.truncado")}</p>
              )}
              {visivel.resposta?.usou_conteudo_oculto && campoPublico && (
                <p role="alert" className="text-sm text-destructive">
                  {t("iaAssistente.oculto")}
                </p>
              )}
              {(inserirExcede || substituirExcede) && (
                <p className="text-sm text-destructive">{t("iaAssistente.limiteCampo")}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={inserirExcede}
                  onClick={() => {
                    onInserir(sugestao);
                    setResultado(null);
                  }}
                >
                  {t("iaAssistente.inserir")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={substituirExcede}
                  onClick={() => {
                    onSubstituir(sugestao);
                    setResultado(null);
                  }}
                >
                  {t("iaAssistente.substituir")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void copiar(sugestao)}
                >
                  {t("iaAssistente.copiar")}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setResultado(null)}>
                  {t("iaAssistente.descartar")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
