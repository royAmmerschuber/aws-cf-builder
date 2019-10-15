# base
- role1
- lambda1
    - permission1
    - ref role1
- lambda2
    - permission2
    - ref role1
# prepared
role1 []
lambda1 []
permission1 [lambda1]
ref(role1) [lambda1]
lambda2 []
permission2 [lambda2]
ref(role1) [lambda2]
# clean
role1
lambda1
lambda1.permission1

lambda2
lambda2.permission1

- load data
- check data
- prepareQueue
    - for each:
        - if main reference
            - if main already exists
                - throw
            - add main ref to queue
            - iterate over subresources
            - iterate over references with ref=true
        - if ref
            - if stub or main ref dont exist
                - add stub to queue
            - add ref to queue
    - iterate results
        - if ref
            - if main is stub
                - if there are multiple references
<!--Todo            - use combining algorithm-->
                    - throw <!--temp-->
                - if there is one reference
                    - create main from ref
- generateObjects
    - if dependency Check fails
        - throw