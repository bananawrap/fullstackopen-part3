const mongoose = require("mongoose")


const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true
    },
    number: {
        type: String,
        minlength: [8, "number must be at least 8 characters long"],
        required: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{2,3}-[0-9]+$/i.test(v)
            },
            message: props => `${props.value} is not a valid format!`
        }
    }
})

contactSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject._v
    }
})

module.exports = mongoose.model("Contact", contactSchema)