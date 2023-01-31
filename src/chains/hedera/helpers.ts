import axios from 'axios';
import config from '../../config';

/**
 * generic function to get hedera paginated results
 * @param resourceUrl
 * @param resourceName
 * @param resultsNumber
 * @returns
 */
const getPaginated = async (
  resourceUrl: string,
  resourceName: string,
  resultsNumber?: number
): Promise<any[]> => {
  let resourceResult = [];
  while (true) {
    const response = await axios.get(resourceUrl);

    if (
      !response?.data ||
      !response.data[resourceName] ||
      !response.data[resourceName].length
    ) {
      return resourceResult;
    }

    resourceResult = resourceResult.concat(response.data[resourceName]);

    if (
      (resultsNumber && resultsNumber <= resourceResult.length) ||
      !response.data.links?.next
    ) {
      return resourceResult;
    }

    resourceUrl = `${config.hedera.restEndpoint}${response.data.links.next}`;
  }
};

export { getPaginated };
