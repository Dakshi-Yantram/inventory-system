const Joi = require('joi');

const vandorSchema = Joi.object({
    date: Joi.date().allow(null),
    iso_certified: Joi.boolean().allow(0, 1),
    Lead_time: Joi.string().max(255).allow(''),
    major_client: Joi.string().max(255).allow(''),
    office_address: Joi.string().max(255).allow(''),
    office_contact_person: Joi.string().max(255).allow(''),
    office_designation: Joi.string().max(255).allow(''),
    office_email: Joi.string().email().max(255).allow(''),
    office_fax: Joi.string().max(20).allow(''),
    office_telephone: Joi.string().max(20).allow(''),
    order_date: Joi.date().allow(null), // Assuming date can be null
    product: Joi.string().max(255).allow(''),
    relevant_field: Joi.string().max(255).allow(''),
    supplier: Joi.string().required(),
    work_address: Joi.string().max(255).allow(''),
    work_contact_person: Joi.string().max(255).allow(''),
    work_designation: Joi.string().max(255).allow(''),
    work_email: Joi.string().email().max(255).allow(''),
    work_fax: Joi.string().max(20).allow(''),
    work_telephone: Joi.string().max(20).allow(''),
});

module.exports = { vandorSchema };
