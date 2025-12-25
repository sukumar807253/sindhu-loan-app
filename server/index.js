require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();

/* ==================== ENV ==================== */
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_BUCKET,
  PORT,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_BUCKET) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

/* ==================== MIDDLEWARE ==================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ==================== SUPABASE ==================== */
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

/* ==================== MULTER ==================== */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const FILE_FIELDS = [
  "memberAadhaarFront",
  "memberAadhaarBack",
  "nomineeAadhaarFront",
  "nomineeAadhaarBack",
  "panCard",
  "formImage",
  "signature",
  "memberPhoto",
  "passbookImage",
];

const uploadFile = async (file, folder) => {
  const ext = path.extname(file.originalname);
  const filePath = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}${ext}`;

  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) throw error;
  return filePath;
};

/* ==================== AUTH ==================== */
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, isAdmin = false } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email: email.toLowerCase(),
          password: hash,
          isAdmin,
          blocked: false,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(400).json({ message: "Email already exists" });
      }
      throw error;
    }

    res.json({ success: true, user: data });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.blocked) {
      return res.status(403).json({ message: "Account blocked" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ RETURN isAdmin → frontend decides redirect
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ==================== CENTERS ==================== */
app.post("/api/centers", async (req, res) => {
  const { name } = req.body;
  const { data, error } = await supabase
    .from("centers")
    .insert([{ name }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get("/api/centers", async (_, res) => {
  const { data } = await supabase.from("centers").select("*");
  res.json(data || []);
});

/* ==================== MEMBERS ==================== */
app.post("/api/members", async (req, res) => {
  const { name, centerId } = req.body;

  const { data, error } = await supabase
    .from("members")
    .insert([{ name, center_id: centerId }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get("/api/members/:centerId", async (req, res) => {
  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("center_id", req.params.centerId);

  res.json(data || []);
});

/* ==================== LOANS ==================== */
app.post(
  "/api/loans",
  upload.fields(FILE_FIELDS.map((f) => ({ name: f, maxCount: 1 }))),
  async (req, res) => {
    try {
      const loanId = `LN-${Date.now()}`;
      const uploaded = {};

      for (const field of FILE_FIELDS) {
        if (req.files?.[field]) {
          uploaded[field] = await uploadFile(
            req.files[field][0],
            `loans/${loanId}`
          );
        }
      }

      const payload = {
        loanid: loanId,

        // IDs
        userid: req.body.userId || null,
        centerid: req.body.centerId || null,
        memberid: req.body.memberId || null,

        // Member details
        membercibil: req.body.memberCibil || null,
        personname: req.body.personName || null,
        dateofbirth: req.body.dateofbirth || null,
        gender: req.body.gender || null,
        religion: req.body.religion || null,
        maritalstatus: req.body.maritalStatus || null,
        aadharno: req.body.aadharNo || null,
        memberwork: req.body.memberwork || null,
        annualincome: req.body.annualIncome || null,

        // Nominee details
        nominee_name: req.body.nomineeName || null,
        nominee_dob: req.body.nomineeDob || null,
        nominee_gender: req.body.nomineeGender || null,
        nominee_religion: req.body.nomineeReligion || null,
        nominee_marital_status: req.body.nomineeMaritalStatus || null,
        nominee_relationship: req.body.nomineeRelationship || null,
        nominee_business: req.body.nomineeBusiness || null,

        // Contact
        mobile_no: req.body.mobileNo || null,
        nominee_mobile: req.body.nomineeMobile || null,
        member_email: req.body.memberEmail || null,
        address: req.body.address || null,
        pincode: req.body.pincode || null,

        // Documents (IMPORTANT – must match DB column names)
        memberaadhaarfront: uploaded.memberAadhaarFront || null,
        memberaadhaarback: uploaded.memberAadhaarBack || null,
        nomineeaadhaarfront: uploaded.nomineeAadhaarFront || null,
        nomineeaadhaarback: uploaded.nomineeAadhaarBack || null,
        pancard: uploaded.panCard || null,
        formimage: uploaded.formImage || null,
        signature: uploaded.signature || null,
        memberphoto: uploaded.memberPhoto || null,
        passbookimage: uploaded.passbookImage || null,

        status: "PENDING",
      };

      const { error } = await supabase.from("loans").insert([payload]);
      if (error) throw error;

      res.json({ success: true, loanId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.get("/api/loans", async (_, res) => {
  const { data } = await supabase
    .from("loans")
    .select("*")
    .order("created_at", { ascending: false });

  res.json(data || []);
});

app.get("/api/users/:userId/loans", async (req, res) => {
  const { data } = await supabase
    .from("loans")
    .select("*")
    .eq("userid", req.params.userId);

  res.json(data || []);
});

app.patch("/api/loans/:id", async (req, res) => {
  const { status } = req.body;

  const { error } = await supabase
    .from("loans")
    .update({ status })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.delete("/api/loans/:id", async (req, res) => {
  const { error } = await supabase
    .from("loans")
    .delete()
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

/* ==================== USERS ==================== */
app.get("/api/users", async (_, res) => {
  const { data } = await supabase.from("users").select("*");
  res.json(data || []);
});

app.patch("/api/users/:id", async (req, res) => {
  const { blocked } = req.body;

  const { error } = await supabase
    .from("users")
    .update({ blocked })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});
/* ==================== GET SINGLE LOAN ==================== */
app.get("/api/loans/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.json(data);
  } catch (err) {
    console.error("FETCH LOAN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});






/* ==================== HEALTH ==================== */
app.get("/", (_, res) => {
  res.json({ status: "OK", message: "Backend running 🚀" });
});

/* ==================== SERVER ==================== */
app.listen(PORT || 5000, () =>
  console.log(`🚀 Server running on port ${PORT || 5000}`)
);
