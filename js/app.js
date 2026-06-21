async function main() {
  const res = await fetch("data/aircraft.json");
  const aircraft = await res.json();
  document.getElementById("count").textContent = `${aircraft.length} aircraft`;
  console.log("Loaded", aircraft.length, "aircraft");
}
main();
