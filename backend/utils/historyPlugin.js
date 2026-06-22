import History from "../models/history.models.js";

function getDiff(oldObj, newObj) {
  const oldVal = {};
  const newVal = {};
  let hasChanges = false;

  const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
  allKeys.delete('_id');
  allKeys.delete('__v');
  allKeys.delete('password');

  allKeys.forEach(key => {
    const o = oldObj?.[key]?.toString?.() || oldObj?.[key];
    const n = newObj?.[key]?.toString?.() || newObj?.[key];

    if (o !== n) {
      oldVal[key] = oldObj?.[key];
      newVal[key] = newObj?.[key];
      hasChanges = true;
    }
  });

  return { hasChanges, oldVal, newVal };
}

const historyPlugin = (schema, options) => {
  const entityType = options && options.entityType ? options.entityType : "User";

  schema.pre("save", function (next) {
    if (!this.isNew) {
      this._original = { ...this.toObject() };
    }
    next();
  });

  // After save: write history AFTER response — never blocks the request
  schema.post("save", function (doc) {
    if (!this._original) return;
    const original = this._original;
    setImmediate(async () => {
      try {
        const { hasChanges, oldVal, newVal } = getDiff(original, doc.toObject());
        if (hasChanges) {
          await History.create({
            entity_type: entityType,
            entity_id: doc._id,
            action: "UPDATE",
            tag: "Updated",
            old_value: oldVal,
            new_value: newVal,
          });
        }
      } catch (err) {
        console.error("Error saving history (post-save):", err);
      }
    });
  });

  // Capture snapshot before findOneAndUpdate — use lean() for speed (no mongoose hydration)
  schema.pre("findOneAndUpdate", async function () {
    this._original = await this.model.findOne(this.getQuery()).lean();
  });

  // After findOneAndUpdate: write history AFTER response — never blocks the request
  schema.post("findOneAndUpdate", function (doc) {
    if (!doc || !this._original) return;
    const original = this._original;
    setImmediate(async () => {
      try {
        const { hasChanges, oldVal, newVal } = getDiff(original, doc.toObject());
        if (hasChanges) {
          await History.create({
            entity_type: entityType,
            entity_id: doc._id,
            action: "UPDATE",
            tag: "Updated",
            old_value: oldVal,
            new_value: newVal,
          });
        }
      } catch (err) {
        console.error("Error saving history (post-findOneAndUpdate):", err);
      }
    });
  });

  // After delete: write history AFTER response — never blocks the request
  schema.post("findOneAndDelete", function (doc) {
    if (!doc) return;
    setImmediate(async () => {
      try {
        await History.create({
          entity_type: entityType,
          entity_id: doc._id,
          action: "DELETE",
          tag: "Deleted",
          old_value: doc.toObject(),
        });
      } catch (err) {
        console.error("Error saving history (post-delete):", err);
      }
    });
  });
};

export default historyPlugin;
