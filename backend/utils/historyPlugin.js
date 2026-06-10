import History from "../models/history.models.js";

const historyPlugin = (schema, options) => {
  const entityType = options && options.entityType ? options.entityType : "User";

  // Pre-save hook to capture old values for updates
  schema.pre("save", function (next) {
    if (!this.isNew) {
      // capture original document before saving
      this._original = { ...this.toObject() };
    }
    next();
  });

  // Post-save hook to create history
  schema.post("save", async function (doc, next) {
    try {
      const action = doc.isNew || !doc._original ? "CREATE" : "UPDATE";
      const tag = action === "CREATE" ? "Created" : "Updated";
      const oldValue = doc._original || null;
      
      const historyDoc = new History({
        entity_type: entityType,
        entity_id: doc._id,
        action,
        tag,
        old_value: oldValue,
        new_value: doc.toObject(),
      });
      await historyDoc.save();
    } catch (err) {
      console.error("Error saving history:", err);
    }
    next();
  });

  // For findOneAndUpdate
  schema.post("findOneAndUpdate", async function (doc, next) {
    if (!doc) return next();
    try {
      const historyDoc = new History({
        entity_type: entityType,
        entity_id: doc._id,
        action: "UPDATE",
        tag: "Updated",
        new_value: doc.toObject(),
      });
      await historyDoc.save();
    } catch (err) {
      console.error("Error saving history:", err);
    }
    next();
  });

  // For findOneAndDelete
  schema.post("findOneAndDelete", async function (doc, next) {
    if (!doc) return next();
    try {
      const historyDoc = new History({
        entity_type: entityType,
        entity_id: doc._id,
        action: "DELETE",
        tag: "Deleted",
        old_value: doc.toObject(),
      });
      await historyDoc.save();
    } catch (err) {
      console.error("Error saving history:", err);
    }
    next();
  });
};

export default historyPlugin;
