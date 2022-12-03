declare namespace Jest {
    interface Test {
        repeat: (
            times: number,
            name: string,
            fn?: ProviderCallback,
            timeout?: number
         ) => void;
    }
}