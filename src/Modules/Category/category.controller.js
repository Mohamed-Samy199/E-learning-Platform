import slugify from "slugify";
import categoryModel from "../../../DB/Models/category.model.js";

export const createCategory = async (req, res, next) => {
    const { name } = req.body;
    const slug = slugify(name);
    if (await categoryModel.findOne({ name })) {
        return next(new Error(`Dublicate category name ${name}`, { cause: 409 }));
    }
    const category = await categoryModel.create({ name, slug, createdBy: req.user._id });
    return res.status(201).json({ message: "Done", category });
}
export const updateCategory = async (req, res, next) => {
    const { name } = req.body;
    const { categoryId } = req.params;
    const category = await categoryModel.findById(categoryId);
    if (!category) {
        return next(new Error("In-valid category id"));
    }
    if (name.toLowerCase()) {
        if (category.name === name) {
            return next(new Error(`sorry, can not update name ${name}`));
        }
        category.name = name;
        category.slug = slugify(name);
    }
    category.updatedBy = req.user._id;
    await category.save();
    return res.status(200).json({ message: "Done", category });
}