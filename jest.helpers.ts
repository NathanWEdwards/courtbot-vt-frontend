test.repeat = async (
    times: number,
    name: string,
    fn?: jest.ProvidesCallback,
    timeout?: number
) => {
    await Promise.all(
        Array(times)
            .fill(undefined)
            .map((_, _index) => {
                return test(name.valueOf(), fn, timeout);
            })
    )
}