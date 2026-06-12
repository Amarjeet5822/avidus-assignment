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

  schema.post("save", async function (doc) {
    if (!this._original) return;

    try {
      const oldObj = this._original;
      const newObj = doc.toObject();
      const { hasChanges, oldVal, newVal } = getDiff(oldObj, newObj);

      if (hasChanges) {
        const historyDoc = new History({
          entity_type: entityType,
          entity_id: doc._id,
          action: "UPDATE",
          tag: "Updated",
          old_value: oldVal,
          new_value: newVal,
        });
        historyDoc.save().catch(err => {
          console.error("Error saving history:", err);
        });
      }
    } catch (err) {
      console.error("Error saving history:", err);
    }
  });

  schema.pre("findOneAndUpdate", async function () {
    this._original = await this.model.findOne(this.getQuery());
  });

  schema.post("findOneAndUpdate", async function (doc) {
    if (!doc || !this._original) return;
    try {
      const oldObj = this._original.toObject();
      const newObj = doc.toObject();
      const { hasChanges, oldVal, newVal } = getDiff(oldObj, newObj);

      if (hasChanges) {
        const historyDoc = new History({
          entity_type: entityType,
          entity_id: doc._id,
          action: "UPDATE",
          tag: "Updated",
          old_value: oldVal,
          new_value: newVal,
        });
        historyDoc.save().catch(err => {
          console.error("Error saving history:", err);
        });
      }
    } catch (err) {
      console.error("Error saving history:", err);
    }
  });

  schema.post("findOneAndDelete", async function (doc) {
    if (!doc) return;
    try {
      const historyDoc = new History({
        entity_type: entityType,
        entity_id: doc._id,
        action: "DELETE",
        tag: "Deleted",
        old_value: doc.toObject(),
      });
      historyDoc.save().catch(err => {
        console.error("Error saving history:", err);
      });
    } catch (err) {
      console.error("Error saving history:", err);
    }
  });
};

export default historyPlugin;
