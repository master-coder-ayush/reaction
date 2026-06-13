import { loadEnvLocal } from "./load-env";

loadEnvLocal();

// Sprint 6 seed — Visual Reaction Trees (§6.3). Seeds tree_nodes + tree_edges
// for the Hydrocarbons and Haloalkanes chapters. Idempotent: a chapter's tree is
// wiped and re-inserted so re-running keeps it in sync with this file.
//
// Layout: `col` is depth (left→right), `row` is the vertical slot. Edge colors
// follow the app-wide reaction-type palette (PLAN.md §"Color Coding").

type NodeSpec = {
  key: string;
  name: string;
  color?: string;
  col: number;
  row: number;
};

type EdgeSpec = {
  from: string;
  to: string;
  reagent: string;
  color: string;
};

type TreeSpec = {
  chapter: number;
  nodes: NodeSpec[];
  edges: EdgeSpec[];
};

const TREES: TreeSpec[] = [
  // ---- Chapter 1: Hydrocarbons (the PLAN.md example tree) ----------------
  {
    chapter: 1,
    nodes: [
      { key: "alkane", name: "Alkane", color: "blue", col: 0, row: 2 },
      { key: "haloalkane", name: "Haloalkane", color: "purple", col: 1, row: 2 },
      { key: "alcohol", name: "Alcohol", color: "teal", col: 2, row: 2 },
      { key: "aldehyde", name: "Aldehyde", color: "red", col: 3, row: 1 },
      { key: "acid", name: "Carboxylic Acid", color: "red", col: 4, row: 1 },
      { key: "alkene", name: "Alkene", color: "orange", col: 3, row: 3 },
    ],
    edges: [
      { from: "alkane", to: "haloalkane", reagent: "Cl₂, hv", color: "purple" },
      { from: "haloalkane", to: "alcohol", reagent: "KOH (aq)", color: "purple" },
      { from: "alcohol", to: "aldehyde", reagent: "PCC", color: "red" },
      { from: "aldehyde", to: "acid", reagent: "KMnO₄", color: "red" },
      { from: "alcohol", to: "alkene", reagent: "H₂SO₄, heat", color: "orange" },
    ],
  },
  // ---- Chapter 2: Haloalkanes --------------------------------------------
  {
    chapter: 2,
    nodes: [
      { key: "haloalkane", name: "Haloalkane", color: "purple", col: 0, row: 2 },
      { key: "alcohol", name: "Alcohol", color: "teal", col: 1, row: 0 },
      { key: "nitrile", name: "Nitrile", color: "teal", col: 1, row: 2 },
      { key: "amine", name: "Amine", color: "green", col: 2, row: 2 },
      { key: "alkene", name: "Alkene", color: "orange", col: 1, row: 4 },
    ],
    edges: [
      { from: "haloalkane", to: "alcohol", reagent: "KOH (aq)", color: "purple" },
      { from: "haloalkane", to: "nitrile", reagent: "KCN (alc)", color: "teal" },
      { from: "nitrile", to: "amine", reagent: "LiAlH₄", color: "green" },
      { from: "haloalkane", to: "alkene", reagent: "KOH (alc)", color: "orange" },
    ],
  },
  // ---- Chapter 3: Alcohols, Phenols & Ethers -----------------------------
  {
    chapter: 3,
    nodes: [
      { key: "alcohol", name: "Alcohol", color: "teal", col: 0, row: 2 },
      { key: "aldehyde", name: "Aldehyde", color: "red", col: 1, row: 0 },
      { key: "acid", name: "Carboxylic Acid", color: "red", col: 2, row: 0 },
      { key: "alkene", name: "Alkene", color: "orange", col: 1, row: 2 },
      { key: "haloalkane", name: "Haloalkane", color: "purple", col: 1, row: 4 },
    ],
    edges: [
      { from: "alcohol", to: "aldehyde", reagent: "PCC", color: "red" },
      { from: "aldehyde", to: "acid", reagent: "KMnO₄", color: "red" },
      { from: "alcohol", to: "alkene", reagent: "H₂SO₄, 443 K", color: "orange" },
      { from: "alcohol", to: "haloalkane", reagent: "SOCl₂", color: "purple" },
    ],
  },
  // ---- Chapter 4: Aldehydes & Ketones ------------------------------------
  {
    chapter: 4,
    nodes: [
      { key: "aldehyde", name: "Aldehyde", color: "red", col: 0, row: 1 },
      { key: "acid", name: "Carboxylic Acid", color: "red", col: 1, row: 0 },
      { key: "alcohol1", name: "1° Alcohol", color: "teal", col: 1, row: 2 },
      { key: "ketone", name: "Ketone", color: "blue", col: 0, row: 3 },
      { key: "alcohol2", name: "2° Alcohol", color: "teal", col: 1, row: 3 },
    ],
    edges: [
      { from: "aldehyde", to: "acid", reagent: "KMnO₄", color: "red" },
      { from: "aldehyde", to: "alcohol1", reagent: "NaBH₄", color: "green" },
      { from: "ketone", to: "alcohol2", reagent: "NaBH₄", color: "green" },
    ],
  },
  // ---- Chapter 5: Carboxylic Acids ---------------------------------------
  {
    chapter: 5,
    nodes: [
      { key: "acid", name: "Carboxylic Acid", color: "red", col: 0, row: 2 },
      { key: "acylchloride", name: "Acyl Chloride", color: "purple", col: 1, row: 0 },
      { key: "ester", name: "Ester", color: "purple", col: 1, row: 2 },
      { key: "amide", name: "Amide", color: "purple", col: 1, row: 4 },
      { key: "alcohol", name: "1° Alcohol", color: "teal", col: 2, row: 2 },
    ],
    edges: [
      { from: "acid", to: "acylchloride", reagent: "SOCl₂", color: "purple" },
      { from: "acid", to: "ester", reagent: "R-OH / H₂SO₄", color: "purple" },
      { from: "acid", to: "amide", reagent: "NH₃, heat", color: "purple" },
      { from: "acid", to: "alcohol", reagent: "LiAlH₄", color: "green" },
    ],
  },
];

async function main() {
  const { db } = await import("../db");
  const { categories, treeNodes, treeEdges } = await import("../db/schema");
  const { eq } = await import("drizzle-orm");

  const catRows = await db
    .select({ id: categories.id, orderIndex: categories.orderIndex })
    .from(categories);
  const catId = new Map(catRows.map((c) => [c.orderIndex, c.id]));

  for (const tree of TREES) {
    const categoryId = catId.get(tree.chapter);
    if (!categoryId) {
      console.warn(`! skipping chapter ${tree.chapter} — no category`);
      continue;
    }

    // Re-sync: clear then re-insert this chapter's tree.
    await db.delete(treeEdges).where(eq(treeEdges.categoryId, categoryId));
    await db.delete(treeNodes).where(eq(treeNodes.categoryId, categoryId));

    await db.insert(treeNodes).values(
      tree.nodes.map((n) => ({
        categoryId,
        nodeKey: n.key,
        compoundName: n.name,
        color: n.color ?? null,
        col: n.col,
        row: n.row,
      }))
    );
    await db.insert(treeEdges).values(
      tree.edges.map((e) => ({
        categoryId,
        fromKey: e.from,
        toKey: e.to,
        reagentLabel: e.reagent,
        color: e.color,
      }))
    );

    console.log(
      `+ tree chapter ${tree.chapter}: ${tree.nodes.length} nodes, ${tree.edges.length} edges`
    );
  }

  console.log("✅ Tree seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Tree seed failed:", err);
    process.exit(1);
  });
