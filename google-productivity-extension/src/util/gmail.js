export async function getMessagesFromThreads({ max = 10 } = {}) {
    const { gapi } = window;
    if (!gapi) {
        throw new Error('gapi not loaded');
    }

    const listOptions = {
        userId: 'me',
        maxResults: max
    };

    const response = await gapi.client.gmail.users.threads.list(listOptions);
    const threadsData = JSON.parse(response.body);

    const {threads} = threadsData;

    // load the thread data
    const threadPromises = [];
    for (const thread of threads) {
        const threadOptions = {
            userId: 'me',
            id: thread.id,
            format: 'MINIMAL'
        }
        threadPromises.push(gapi.client.gmail.users.threads.get(threadOptions));
    }

    const threadResponses = await Promise.all(threadPromises);

    const messagePromises = [];
    for (const threadResponse of threadResponses) {
        const data = JSON.parse(threadResponse.body);

        // grab the last message
        const message = data.messages.pop();

        const messageOptions = {
            userId: 'me',
            id: message.id,
            format: 'FULL'
        }
        messagePromises.push(gapi.client.gmail.users.messages.get(messageOptions));
    }

    const messageResponses = await Promise.all(messagePromises);

    const messages = [];
    for (const messageResponse of messageResponses) {
        const data = JSON.parse(messageResponse.body);

        messages.push(data);
    }

    return messages;
}