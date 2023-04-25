import axios from "axios";
import {
    CompletionItemKind, createConnection,
    ProposedFeatures, TextDocuments
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import * as fs from "fs";
import * as vscode from "vscode";

//const fs = require('fs');

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

// Define the file path for the log file
const logFilePath = __dirname + "/debugging.log";

// Function to write log messages to the log file
const writeLog = (message: string) => {
    fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
};

connection.onInitialize((params) => {
    return {
        capabilities: {
            completionProvider: {
                resolveProvider: true
            }
        }
    };
});

const API_URL = "https://api-inference.huggingface.co/models/EleutherAI/gpt-neox-20b";
// eslint-disable-next-line @typescript-eslint/naming-convention
const headers = { "Authorization": "Bearer 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" };

var len = 0;

connection.onCompletion(async (params) => {
    let text = documents.get(params.textDocument.uri)?.getText();
    if (text === undefined) {
        return [];
    }
    const lines = text.split("\n");
    const lineLen = lines.length - 1;
    len = lines[lineLen].length - 1; // Stuff currently typed by the user

    const startTime = new Date().getTime(); // Record the start time

    try {
        let response = await axios.post(
            String(API_URL),
            { "inputs": text, "parameters": {"max_length": 512} }, { headers: headers }
        );

        const endTime = new Date().getTime(); // Record the end time

        // DEBUGGING STATEMENTS
        writeLog(`Sent request:      ${JSON.stringify({ "inputs": text })}`); // Log the sent request
        writeLog(`Received response: ${JSON.stringify(response.data)}`);      // Log the response
        writeLog(`Response time:     ${endTime - startTime}ms`);              // Log the response time

        // Create a response for the user, based on what has been generated in the LLM
        let responseWanted = response.data[0].generated_text.split("\n"); // Generate an array of all lines of response from LLM
        let completion1: any = "";
        let completion2: any = "";
        let completion3: any = "";
        // Loop over all "generated lines", but add only the first line after what the user is CURRENTLY typing on to the first suggestion, 1 total lines.
        for(let i = lineLen; i < responseWanted.length && i < lineLen + 1; i++){ 
            completion1 += responseWanted[i] + "\n";
        }
        // Loop over all "generated lines," but only starting on the line the user is CURRENTLY typing on, and add 2 total lines.
        for(let i = lineLen; i < responseWanted.length && i < lineLen + 2; i++){ 
            completion2 += responseWanted[i] + "\n";
        }
        // Loop over all "generated lines," but only starting on the line the user is CURRENTLY typing on, and add 3 total lines.
        for(let i = lineLen; i < responseWanted.length && i < lineLen + 3; i++){ 
            completion3 += responseWanted[i] + "\n";
        }

        // DEBUGGING STATEMENT
        writeLog('COMPLETION OPTION 1:\n' + completion1);
        writeLog('COMPLETION OPTION 2:\n' + completion2);
        writeLog('COMPLETION OPTION 3:\n' + completion3);

        return [
            {
                label: completion1, // First completion
                textEdit: completion1,
                kind: CompletionItemKind.Text,
                data: 1
            },
            {
                label: completion2, // Second completion
                textEdit: completion2,
                kind: CompletionItemKind.Text,
                data: 2 // Different data variables have to be used here
            },
            {
                label: completion3, // Third completion
                textEdit: completion3,
                kind: CompletionItemKind.Text,
                data: 3 // And different data variables have to be used here
            }
        ];
    } catch (error) {
        // Return an empty array if there was an error
        console.error(error);
        return []; 
    }
});

// Display the suggestion to the user
connection.onCompletionResolve((item) => {
    if (item.data === 1 || item.data === 2 || item.data === 3) {
        
        item.detail = "Auto-Code completion!!";
        item.documentation = "Auto-Code completion suggestion!!";
    }
    return item;
});

documents.listen(connection);
connection.listen();