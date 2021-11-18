export const x=Meta({
    resource:new Custom.Beta.Alpha()
        .paul("hello"),
    creationPolicy:{
        DontCreateAnything:true
    }
})
export const m1=Meta({
    resource:new Iam.Policy()
        .Document({Version:"2012-10-17",Statement:[]})
        .Name("paul"),
    dependsOn:[
        x
    ],
    metadata:{
        yoldafjhl:"jfdkaj"
    }
})
