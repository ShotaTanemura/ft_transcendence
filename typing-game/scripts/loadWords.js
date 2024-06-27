// CSVを読み込み、パースする
export async function loadWords() {
  try {
    const response = await fetch("words.csv");
    const data = await response.text();
    return parseCSV(data);
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}
// CSVをパースする関数
function parseCSV(data) {
  const rows = data.split("\n");
  return rows.slice(1).map((row) => row.trim()); // ヘッダーを除いてトリムされた単語を返す
}
