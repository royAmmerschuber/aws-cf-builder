export const sg1=new EC2.SecurityGroup()
    .Description("paul")
    .name("calabrese")
    .vpcId("vpc-randomid")
    .tag("paul","meier")
    .tag({
        kevin:"seven",
        eleven:"heaven"
    })
    .egress(
        new EC2.SecurityGroup.Egress()
            .cidrIp("somecidr")
            .Protocol("-1")
            .description("velo")
            .fromPort(200)
            .toPort(300),
        new EC2.SecurityGroup.Egress()
            .cidrIpv6("somecidr6")
            .Protocol("icmp"),
        new EC2.SecurityGroup.Egress()
            .destinationPrefixList("listId")
            .Protocol("icmpv6"),
        new EC2.SecurityGroup.Egress()
            .destinationGroup("id","sg-someid")
            .Protocol("tcp")
    )
    .ingress(
        new EC2.SecurityGroup.Ingress()
            .cidrIp("somecidr")
            .Protocol("-1")
            .description("yolo")
            .fromPort(200)
            .toPort(300),
        new EC2.SecurityGroup.Ingress()
            .cidrIpv6("somecidr6")
            .Protocol("icmp"),
        new EC2.SecurityGroup.Ingress()
            .sourcePrefixList("listId")
            .Protocol("icmpv6"),
        new EC2.SecurityGroup.Ingress()
            .sourceGroup("id","sg-someid")
            .Protocol("tcp"),
        new EC2.SecurityGroup.Ingress()
            .sourceGroup("name","peter")
            .Protocol("tcp"),
    )
export const sg2=new EC2.SecurityGroup()
        .Description(sg1.r)
export const out1=new Output()
        .Value(sg2.a.GroupId)
export const out2=new Output()
        .Value(sg2.a.VpcId)