import axios from "axios";
import _ from "lodash";
import { Coding } from "../types/fhir";

/**
 * Retrieves UCUM codes related to the given search text
 * @param text Text to search for
 * @returns Array of related UCUM codes
 */
export async function searchForUcumUnit(text: string): Promise<Coding[]> {
    return await memoizedClinicalTableSearch(text);
}

export const memoizedClinicalTableSearch = _.memoize(clinicalTableSearch)

/**
 * Uses the NIH's Clinical Table Search Service's UCUM API to search for the specified text
 * @param text Text to search for
 * @returns Array of returned UCUM codes
 */
 async function clinicalTableSearch(text: string): Promise<Coding[]> {
    let res: Coding[] = [];
    try {
        const response = await axios({
            url: "https://clinicaltables.nlm.nih.gov/api/ucum/v3/search",
            method: "GET",
            params: {
                terms: text,
            }
        })
        // Convert response to Coding array
        const returnedCodes = response.data[3] as Array<never>;
        res = returnedCodes.map<Coding>(v => {
            return {
                code: v[0],
                display: v[1],
                system: "http://unitsofmeasure.org",
            }
        })
    }
    catch (e) {
        console.log(`Error contacting Clinical Table Search Service api: ${e}`);
    }

    return res
}