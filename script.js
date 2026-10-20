const $ = (id) => document.getElementById(id);

const yearNotes = {
  2026: "2026: referência de teste informada pela Receita Federal como 0,9% de CBS e 0,1% de IBS.",
  2027: "2027: início da transição; a CBS passa a considerar redução de 0,1 ponto percentual em relação à alíquota de referência aplicável.",
  2028: "2028: continuidade da transição, com IBS de 0,1% e parâmetros da CBS dependentes da alíquota de referência.",
  2029: "2029: referência de transição de 10% IBS e 90% ICMS/ISS.",
  2030: "2030: referência de transição de 20% IBS e 80% ICMS/ISS.",
  2031: "2031: referência de transição de 30% IBS e 70% ICMS/ISS.",
  2032: "2032: referência de transição de 40% IBS e 60% ICMS/ISS.",
  2033: "2033: vigência integral do novo modelo e extinção do ICMS e do ISS."
};

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const percent = (n) => `${n.toFixed(2).replace(".", ",")}%`;

function number(id) {
  const value = Number($(id).value);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function firstByLocal(root, name) {
  if (!root) return null;
  return Array.from(root.getElementsByTagName("*")).find((el) => el.localName === name) || null;
}

function childText(parent, name) {
  if (!parent) return "";
  const el = Array.from(parent.children).find((child) => child.localName === name);
  return el ? (el.textContent || "").trim() : "";
}

function parseMoney(text) {
  if (!text) return 0;
  let t = text.trim();
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}

function extractNfe(data) {
  const doc = new DOMParser().parseFromString(data, "text/xml");
  if (doc.getElementsByTagName("parsererror").length) {
    throw new Error("O arquivo selecionado não é um XML válido.");
  }

  const total = firstByLocal(doc, "total");
  const icmsTot = firstByLocal(total, "ICMSTot");
  const issTot = firstByLocal(total, "ISSQNtot");

  const base = parseMoney(childText(icmsTot, "vNF")) || parseMoney(childText(total, "vNF"));
  if (base <= 0) throw new Error("Não encontrei o valor total (vNF) neste XML.");

  const breakdown = {
    ICMS: parseMoney(childText(icmsTot, "vICMS")),
    PIS: parseMoney(childText(icmsTot, "vPIS")) + parseMoney(childText(issTot, "vPIS")),
    COFINS: parseMoney(childText(icmsTot, "vCOFINS")) + parseMoney(childText(issTot, "vCOFINS")),
    ISS: parseMoney(childText(issTot, "vISS")),
    IPI: parseMoney(childText(icmsTot, "vIPI"))
  };

  let taxes = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  if (taxes <= 0) taxes = parseMoney(childText(icmsTot, "vTotTrib"));

  return { base, taxes, breakdown };
}

function setXmlStatus(message, kind) {
  const el = $("xmlStatus");
  el.textContent = message;
  el.className = kind ? `xml-status ${kind}` : "xml-status";
}

const XML_HINT = "Selecione o XML de uma NF-e ou NFC-e para preencher o valor total e a carga atual automaticamente.";

function applyImport({ base, taxes, breakdown }) {
  $("base").value = base.toFixed(2);
  const rate = base > 0 ? (taxes / base) * 100 : 0;
  $("oldRate").value = rate.toFixed(2);
  calculate();

  const parts = Object.entries(breakdown)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => `${name} ${money.format(value)}`);
  const detail = parts.length ? parts.join(" + ") : "impostos estimados (vTotTrib)";
  setXmlStatus(`XML importado: base ${money.format(base)} e carga atual de ${percent(rate)} (${detail}).`, "ok");
}

function calculate() {
  const base = number("base");
  const oldRate = number("oldRate");
  const newRate = number("newRate");

  const oldValue = base * oldRate / 100;
  const newValue = base * newRate / 100;
  const difference = oldValue - newValue;
  const points = newRate - oldRate;
  const variation = oldValue === 0 ? 0 : (difference / oldValue) * 100;

  $("oldValue").textContent = money.format(oldValue);
  $("newValue").textContent = money.format(newValue);
  $("oldRateView").textContent = percent(oldRate);
  $("newRateView").textContent = percent(newRate);
  $("difference").textContent = money.format(Math.abs(difference));

  const reduced = difference >= 0;
  $("differenceText").textContent = reduced
    ? "O cenário novo representa uma redução estimada."
    : "O cenário novo representa um aumento estimado.";

  const badge = $("badge");
  badge.className = `badge ${reduced ? "down" : "up"}`;
  badge.textContent = `${points > 0 ? "+" : "−"}${Math.abs(points).toFixed(2).replace(".", ",")} p.p.`;

  $("variation").textContent = `${variation > 0 ? "+" : "−"}${Math.abs(variation).toFixed(2).replace(".", ",")}%`;

  const max = Math.max(oldRate, newRate, 1);
  $("oldFill").style.width = `${Math.min(oldRate / max * 100, 100)}%`;
  $("newFill").style.width = `${Math.min(newRate / max * 100, 100)}%`;
}

function updateYear() {
  const year = $("year").value;
  $("yearNote").textContent = yearNotes[year] || "";
}

["base", "oldRate", "newRate"].forEach(id => {
  $(id).addEventListener("input", calculate);
});

$("year").addEventListener("change", updateYear);

$("xmlFile").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) {
    setXmlStatus(XML_HINT);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      applyImport(extractNfe(String(reader.result)));
    } catch (error) {
      setXmlStatus(error.message, "error");
    }
  };
  reader.onerror = () => setXmlStatus("Não foi possível ler o arquivo.", "error");
  reader.readAsText(file);
});

$("useComponents").addEventListener("click", () => {
  const total = number("cbs") + number("ibs");
  $("newRate").value = total.toFixed(2);
  calculate();
});

$("resetBtn").addEventListener("click", () => {
  $("base").value = "100000";
  $("oldRate").value = "18";
  $("newRate").value = "17";
  $("cbs").value = "0.9";
  $("ibs").value = "0.1";
  $("xmlFile").value = "";
  setXmlStatus(XML_HINT);
  calculate();
});

updateYear();
calculate();
