const ts = Date.now();
const body = {
  customer: {
    email: `newtest.${ts}@testeventco.com`,
    firstname: "Jane",
    lastname: "Doe",
    addresses: [{
      firstname: "Jane",
      lastname: "Doe",
      street: ["123 Main St"],
      city: "Los Angeles",
      region: { region_code: "CA" },
      postcode: "90001",
      country_id: "US",
      telephone: "5550001234",
      default_billing: true,
      default_shipping: true,
    }],
  },
  password: "TestPass123!",
};

console.log("Using email:", body.customer.email);

const res = await fetch("https://lachairs.com/rest/V1/customers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log("Status:", res.status, res.statusText);
try {
  const j = JSON.parse(text);
  console.log(JSON.stringify({ id: j.id, email: j.email, message: j.message }, null, 2));
} catch {
  console.log(text.slice(0, 500));
}

