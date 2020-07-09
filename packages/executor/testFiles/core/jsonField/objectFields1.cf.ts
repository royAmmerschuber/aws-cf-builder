export const test=new Output().Value(new JSONField({
    test:new Custom.B()
        .paul("meier")
        .sven(5),
    local:Local().value(new Custom.B()
        .kevin("nivek"))
}))