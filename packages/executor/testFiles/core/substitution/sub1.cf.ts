import { ReferenceField } from "aws-cf-builder-core/fields/referenceField"

const ref=new ReferenceField("someRef")
export const o=[
    new Output().Value(Sub`some random text \${${"yolo"}}`),
    new Output().Value(Sub("some ${placeholder} ${placeholder} ${!placeholder}",{
        placeholder:"text"
    })),
    new Output().Value(Sub`some random text \${${ref}}`),
    new Output().Value(Sub("some ${placeholder} ${placeholder} ${!placeholder}",{
        placeholder:ref
    })),
    new Output().Value(Sub`subception ${Sub`random text`}`),
    new Output().Value(Sub`subception ${Sub`random ${ref}`}`),
    new Output().Value(Sub("some ${placeholder} ${placeholder} ${!placeholder}",{
        placeholder:Sub`yo${ref}`
    })),
    new Output().Value(Sub`klaus is greate ${Join(".",["a","b","c"])}`),
    new Output().Value(Sub`klaus is greate ${Join(".",["a",ref,"c"])}`),
    new Output().Value(Sub("klaus is greate ${placeholder}",{
        placeholder:Join(".",["a","b","c"])
    })),
    new Output().Value(Sub("klaus is greate ${placeholder}",{
        placeholder:Join(".",["a",ref,"c"])
    }))
]