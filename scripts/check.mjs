process.env.JWT_SECRET="x".repeat(32); process.env.MONGODB_URI="mongodb://127.0.0.1:27017/t"; process.env.CLIENT_URLS="*";
process.env.OAUTH_SHARED_SECRET="test-bridge-secret";
const { slugify } = await import("../src/utils/slugify.js");
const { buildProductQuery, omitKeys, SORT_MAP } = await import("../src/utils/queryFeatures.js");
const { serializeProduct } = await import("../src/utils/serialize.js");
const { brands, categories, products } = await import("../src/seed/data.js");
let fail = 0;
const ok = (label, cond, extra="") => { console.log(`${cond?"PASS":"FAIL"}  ${label} ${extra}`); if(!cond) fail++; };

// --- seed integrity ---
const bset = new Set(brands.map(b=>slugify(b.name)));
const cset = new Set(categories.map(c=>slugify(c.name)));
const badB = products.filter(p=>!bset.has(p.brandSlug)).map(p=>`${p.name}[${p.brandSlug}]`);
const badC = products.filter(p=>!cset.has(p.categorySlug)).map(p=>`${p.name}[${p.categorySlug}]`);
ok("every product brand resolves", badB.length===0, badB.join(", "));
ok("every product category resolves", badC.length===0, badC.join(", "));
const slugs = products.map(p=>slugify(p.name));
const dups = slugs.filter((s,i)=>slugs.indexOf(s)!==i);
ok("no duplicate product slugs", dups.length===0, dups.join(", "));
ok("product count", products.length>=80, `= ${products.length}`);
ok("featured products exist", products.filter(p=>p.isFeatured).length>=15, `= ${products.filter(p=>p.isFeatured).length}`);
ok("menuBrands all resolve", categories.every(c=>c.menuBrands.every(m=>bset.has(m))));
ok("specs present on phones", products.filter(p=>p.categorySlug==="phones").every(p=>p.specs.display && p.specs.battery));
ok("out-of-stock has stock 0", products.filter(p=>p.availability==="out-of-stock").every(p=>p.stock===0));

// --- query builder ---
let q = buildProductQuery({category:"phones", brand:"samsung,apple", network:"5G", minPrice:"50000", maxPrice:"200000", availability:"in-stock", sort:"price-asc", page:"2", limit:"12", q:"galaxy"});
ok("filter.categorySlug", q.filter.categorySlug==="phones");
ok("filter.brandSlug $in", JSON.stringify(q.filter.brandSlug)==='{"$in":["samsung","apple"]}');
ok("filter.networks $in", JSON.stringify(q.filter.networks)==='{"$in":["5G"]}');
ok("filter.price range", q.filter.price.$gte===50000 && q.filter.price.$lte===200000);
ok("availability", q.filter.availability==="in-stock");
ok("search $or built", Array.isArray(q.filter.$or) && q.filter.$or.length===3);
ok("sort price-asc", JSON.stringify(q.sort)===JSON.stringify(SORT_MAP["price-asc"]));
ok("pagination skip", q.page===2 && q.limit===12 && q.skip===12);
q = buildProductQuery({});
ok("defaults: no filter", Object.keys(q.filter).length===0);
ok("defaults: page1 limit24", q.page===1 && q.limit===24 && q.skip===0);
q = buildProductQuery({category:"all", network:"all", availability:"all", limit:"9999", page:"-3"});
ok("'all' values ignored", Object.keys(q.filter).length===0);
ok("limit clamped", q.limit===60 && q.page===1);
q = buildProductQuery({q:"a+b(c)"});
ok("regex special chars escaped", q.filter.$or[0].name.source.includes("\\+"));
ok("omitKeys drops dimension", !("brandSlug" in omitKeys({brandSlug:1,price:2},["brandSlug"])));

// --- serializer ---
let s = serializeProduct({_id:"abc", price:100, oldPrice:200, availability:"in-stock", stock:3});
ok("discountPercent", s.discountPercent===50, `=${s.discountPercent}`);
ok("inStock true", s.inStock===true);
ok("id string", s.id==="abc");
s = serializeProduct({_id:"z", price:100, oldPrice:null, availability:"out-of-stock", stock:0});
ok("no discount when no oldPrice", s.discountPercent===0);
ok("inStock false", s.inStock===false);

// --- zod schemas ---
const { registerSchema, loginSchema } = await import("../src/controllers/authController.js");
const { createOrderSchema } = await import("../src/controllers/orderController.js");
ok("register valid", registerSchema.safeParse({name:"Akm Dulal", email:"A@B.com", phone:"01712345678", password:"secret1"}).success);
ok("register rejects bad phone", !registerSchema.safeParse({name:"A B", email:"a@b.com", phone:"0171", password:"secret1"}).success);
ok("register rejects short pw", !registerSchema.safeParse({name:"A B", email:"a@b.com", phone:"01712345678", password:"123"}).success);
ok("email lowercased", registerSchema.safeParse({name:"A B", email:"A@B.COM", phone:"01712345678", password:"secret1"}).data?.email==="a@b.com");
ok("login schema", loginSchema.safeParse({email:"a@b.com", password:"x"}).success);
ok("order schema valid", createOrderSchema.safeParse({items:[{slug:"x", quantity:1}], shipping:{fullName:"Ak Du", phone:"01712345678", address:"House 5 Road 3", city:"Dhaka"}}).success);
ok("order rejects empty cart", !createOrderSchema.safeParse({items:[], shipping:{fullName:"Ak Du", phone:"01712345678", address:"House 5 Road 3", city:"Dhaka"}}).success);
ok("order defaults cod", createOrderSchema.safeParse({items:[{slug:"x",quantity:1}], shipping:{fullName:"Ak Du", phone:"01712345678", address:"House 5 Road 3", city:"Dhaka"}}).data?.paymentMethod==="cod");

// --- Mongoose middleware -------------------------------------------------
// Mongoose 9 dropped the `next` callback. A hook that still declares it throws
// "next is not a function" on every save, which breaks seeding AND register.
// validateSync() does NOT run these hooks, so they must be exercised directly.
const { Brand } = await import("../src/models/Brand.js");
const { Category } = await import("../src/models/Category.js");
const { Product } = await import("../src/models/Product.js");
const { Order } = await import("../src/models/Order.js");
const { User: UserModel } = await import("../src/models/User.js");
const bcrypt = (await import("bcryptjs")).default;

const runHooks = async (doc, kind) => {
  const hooks = doc.schema.s.hooks._pres.get(kind) ?? [];
  for (const h of hooks) await h.fn.call(doc);
  return doc;
};

const brandDoc = await runHooks(new Brand({ name: "Samsung" }), "validate");
ok("Brand pre(validate) sets the slug", brandDoc.slug === "samsung", brandDoc.slug);

const catDoc = await runHooks(new Category({ name: "Smart Watch" }), "validate");
ok("Category pre(validate) sets the slug", catDoc.slug === "smart-watch", catDoc.slug);

const prodDoc = await runHooks(new Product({
  name: "Galaxy S26 Ultra 12/512GB", brand: "000000000000000000000001", brandName: "Samsung",
  brandSlug: "samsung", category: "000000000000000000000002", categorySlug: "phones", price: 1,
}), "validate");
ok("Product pre(validate) sets the slug", prodDoc.slug === "galaxy-s26-ultra-12-512gb", prodDoc.slug);

const orderDoc = await runHooks(new Order({
  user: "000000000000000000000003",
  items: [{ product: "000000000000000000000004", name: "x", slug: "x", price: 1, quantity: 1 }],
  shipping: { fullName: "A B", phone: "01712345678", address: "road 1", city: "Dhaka" },
  itemsTotal: 1, grandTotal: 81,
}), "validate");
ok("Order pre(validate) sets the order number", /^MB-[A-Z0-9]+$/.test(orderDoc.orderNumber), orderDoc.orderNumber);

const userDoc = await runHooks(new UserModel({
  name: "Monir Hossain", email: "hooks@example.com", phone: "01688518962", password: "secret123",
}), "save");
ok("User pre(save) hashes the password", /^\$2[aby]\$/.test(userDoc.password), userDoc.password.slice(0, 7));
ok("hashed password verifies", await bcrypt.compare("secret123", userDoc.password));
ok("matchPassword() accepts the right password", await userDoc.matchPassword("secret123"));
ok("matchPassword() rejects a wrong password", !(await userDoc.matchPassword("wrong-one")));

// After a real save the password path is no longer modified, and saving again
// (say, to update the phone number) must not hash the hash.
const firstHash = userDoc.password;
userDoc.unmarkModified("password");
await runHooks(userDoc, "save");
ok("pre(save) does not re-hash an unchanged password", userDoc.password === firstHash);
ok("password still verifies after a second save", await bcrypt.compare("secret123", userDoc.password));

// --- express app (routes reachable, middleware order, no DB needed) ---
const app = (await import("../src/app.js")).default;
const server = app.listen(5099);
const base="http://127.0.0.1:5099";
const j = async (p,o) => { const r = await fetch(base+p,o); return [r.status, await r.json()]; };
let [st, body] = await j("/"); ok("GET /", st===200 && body.success);
[st, body] = await j("/api"); ok("GET /api index", st===200 && !!body.endpoints.products);
[st, body] = await j("/api/health"); ok("GET /api/health", st===200 && body.status==="ok", `db=${body.db}`);
[st, body] = await j("/api/nope"); ok("unknown route -> 404 json", st===404 && body.success===false, body.message);
[st, body] = await j("/api/auth/register", {method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({name:"x", email:"bad", phone:"1", password:"1"})});
ok("validation middleware -> 400 + details", st===400 && Object.keys(body.details).length===4, JSON.stringify(body.details));
[st, body] = await j("/api/orders/my"); ok("protected route -> 401", st===401, body.message);

// --- OAuth bridge: the guard runs before anything touches the database ---
const oauthBody = {provider:"google", providerAccountId:"1234567890", email:"g@example.com", name:"Google User", image:"https://example.com/a.png"};
const oauth = (headers, payload=oauthBody) => j("/api/auth/oauth", {method:"POST", headers:{"content-type":"application/json", ...headers}, body: JSON.stringify(payload)});
[st, body] = await oauth({}); ok("oauth without secret -> 401", st===401, body.message);
[st, body] = await oauth({"x-oauth-secret":"wrong"}); ok("oauth wrong secret -> 401", st===401);
[st, body] = await oauth({"x-oauth-secret":"test-bridge-secretX"}); ok("oauth longer secret -> 401", st===401);
[st, body] = await oauth({"x-oauth-secret":"test-bridge-secret"}, {provider:"github", providerAccountId:"1", email:"nope", name:""});
ok("oauth bad payload -> 400 before secret-authorised work", st===400, JSON.stringify(body.details));
const { oauthSchema } = await import("../src/controllers/oauthController.js");
ok("oauth schema accepts a Google identity", oauthSchema.safeParse(oauthBody).success);
ok("oauth schema rejects an unknown provider", !oauthSchema.safeParse({...oauthBody, provider:"facebook"}).success);
ok("oauth schema lowercases the email", oauthSchema.safeParse({...oauthBody, email:"G@EXAMPLE.COM"}).data?.email==="g@example.com");

// --- a social account has no phone, and that must be allowed ---
const { User } = await import("../src/models/User.js");
const social = new User({name:"Google User", email:"g2@example.com", password:"x".repeat(20), provider:"google", isVerified:true});
ok("user without phone validates", social.validateSync()===undefined, String(social.validateSync()?.message ?? ""));
const badPhone = new User({name:"X Y", email:"g3@example.com", password:"x".repeat(20), phone:"12345"});
ok("user with a bad phone still fails", badPhone.validateSync()!==undefined);
ok("toSafeJSON hides the password", !("password" in social.toSafeJSON()));
ok("toSafeJSON reports the provider", social.toSafeJSON().provider==="google");
[st, body] = await j("/api/products", {method:"POST", headers:{"content-type":"application/json"}, body:"{}"}); ok("admin route -> 401", st===401);
const r = await fetch(base+"/api/health", {headers:{origin:"https://foo.vercel.app"}});
ok("CORS allows *.vercel.app", r.headers.get("access-control-allow-origin")==="https://foo.vercel.app");
ok("helmet header set", !!r.headers.get("x-content-type-options"));
ok("rate-limit header set", !!r.headers.get("ratelimit"));

server.close();
console.log(fail===0 ? "\nALL CHECKS PASSED" : `\n${fail} CHECK(S) FAILED`);
process.exit(fail===0?0:1);
