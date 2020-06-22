import { ReferenceField } from "aws-cf-builder-core/fields/referenceField";
import { AttributeField } from "aws-cf-builder-core/fields/attributeField";

export const test=new Output().Value(new JSONField({
    paul:new JSONField({
        meier:new ReferenceField("peter"),
        new:new AttributeField("peter","version"),
        sven:"paul",
        karl:new JSONField({
            meier:new ReferenceField("peter"),
            new:new AttributeField("peter","version"),
            sven:"paul",
        })
    })
}))