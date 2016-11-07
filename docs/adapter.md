There are two types of Adapters, the `SBSdkAdapter` and `SBHttpAdapter` build into ng-storyblok but it is easy to create your own.
The difference between those two Adapters is that the `SBSdkAdapter` has a dependency on the Storyblok SDK and needs it to load data. 
The `SBHttpAdapter` does not need the SDK, it loads the data directly from the API endpoint using the Angular2 Http Module. 
By default the `SBSdkAdapter` is provided.