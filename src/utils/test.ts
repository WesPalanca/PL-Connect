import { scrapeMeets } from "./scraper";    


scrapeMeets().then((data: any) => console.log(data)).catch(console.error);
