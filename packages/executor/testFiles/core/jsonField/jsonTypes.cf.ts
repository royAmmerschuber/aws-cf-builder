import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";

export const o=[
    new Output().Value(new JSONField({
        num:{
            a:JSONField.number(new ReferenceField("someRef")),
            b:JSONField.number("129"),
            c:JSONField.number(Sub`184`),
            d:JSONField.number(192)
        },
        str:{
            a:JSONField.string(new ReferenceField("someRef")),
            b:JSONField.string("129"),
            c:JSONField.string(Sub`184`),
            d:JSONField.string(192)
        },
        bool:{
            a:JSONField.boolean(new ReferenceField("someRef")),
            b:JSONField.boolean("true"),
            c:JSONField.boolean(Sub`false`),
            d:JSONField.boolean(false)
        },
        literal:{
            a:JSONField.literal(new ReferenceField("someRef")),
            b:JSONField.literal("129"),
            c:JSONField.literal('{"test":"paul"}'),
            d:JSONField.literal(192),
            e:JSONField.literal(new Parameter("paul").Type("String"))
        },
    }))
]
