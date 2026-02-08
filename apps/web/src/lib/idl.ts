export const loadIdl = async () => {
  try {
    const mod = await import("./idl.json");
    return mod.default || mod;
  } catch (err) {
    throw new Error(
      "IDL not found. Copy contracts/solana/target/idl/solana.json to apps/web/src/lib/idl.json"
    );
  }
};
