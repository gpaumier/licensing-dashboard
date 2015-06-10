/* Images tagged with neither {{Free media}} nor {{Non-free media}} on enwiki */
/* live version: http://quarry.wmflabs.org/query/3945 */
/* use SELECT count(page_title) for only a count */

use enwiki_p;
SELECT page_title
	FROM page, image
	WHERE page.page_namespace = 6
		AND page.page_title = image.img_name
		AND page_id NOT IN (
        	SELECT DISTINCT(tl_from) FROM templatelinks
				WHERE
          				tl_namespace = 10
          			AND tl_from_namespace = 6
          			AND tl_title IN ('Free_media')
        )
		AND page_id NOT IN (
        	SELECT DISTINCT(tl_from) FROM templatelinks
				WHERE
          				tl_namespace = 10
          			AND tl_from_namespace = 6
          			AND tl_title IN ('Non-free_media')
        );
