export const sg=new EC2.SecurityGroup()
    .ingress(new EC2.SecurityGroup.Ingress())
    .egress(new EC2.SecurityGroup.Egress())