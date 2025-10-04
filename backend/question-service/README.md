# Question Service API Guide

### Get Questions

- This endpoint allows retrieval of a random sample of questions from the database, filtered by difficulty and topicTag.
- HTTP Method: `GET`
- Endpoint: http://localhost:8080/questions
- Parameters:
  - Required: `difficulty` and `tag` query parameters
  - Optional: `size` query parameter (sample size to retrieve)
  - Example: http://localhost:8080/questions?difficulty=Easy&tag=array&size=5
- Responses:

  | Response Code               | Explanation                                              |
      |-----------------------------|----------------------------------------------------------|
  | 200 (OK)                    | Success, question data returned                          |
  | 400 (Bad Request)           | Request does not contain expected parameters             |
  | 500 (Internal Server Error) | Database or server error                                 |
- Example API Successful Response:
```
    {
        "_id": "68d54a27cc62393c74f7c24e",
        "difficulty": "Easy",
        "exampleTestcases": "[1]\n0\n[0,10]\n2\n[1,3,6]\n3",
        "question": "<p>You are given an integer array <code>nums</code> and an integer <code>k</code>.</p>\n\n<p>In one operation, you can choose any index <code>i</code> where <code>0 &lt;= i &lt; nums.length</code> and change <code>nums[i]</code> to <code>nums[i] + x</code> where <code>x</code> is an integer from the range <code>[-k, k]</code>. You can apply this operation <strong>at most once</strong> for each index <code>i</code>.</p>\n\n<p>The <strong>score</strong> of <code>nums</code> is the difference between the maximum and minimum elements in <code>nums</code>.</p>\n\n<p>Return <em>the minimum <strong>score</strong> of </em><code>nums</code><em> after applying the mentioned operation at most once for each index in it</em>.</p>\n\n<p>&nbsp;</p>\n<p><strong class=\"example\">Example 1:</strong></p>\n\n<pre>\n<strong>Input:</strong> nums = [1], k = 0\n<strong>Output:</strong> 0\n<strong>Explanation:</strong> The score is max(nums) - min(nums) = 1 - 1 = 0.\n</pre>\n\n<p><strong class=\"example\">Example 2:</strong></p>\n\n<pre>\n<strong>Input:</strong> nums = [0,10], k = 2\n<strong>Output:</strong> 6\n<strong>Explanation:</strong> Change nums to be [2, 8]. The score is max(nums) - min(nums) = 8 - 2 = 6.\n</pre>\n\n<p><strong class=\"example\">Example 3:</strong></p>\n\n<pre>\n<strong>Input:</strong> nums = [1,3,6], k = 3\n<strong>Output:</strong> 0\n<strong>Explanation:</strong> Change nums to be [4, 4, 4]. The score is max(nums) - min(nums) = 4 - 4 = 0.\n</pre>\n\n<p>&nbsp;</p>\n<p><strong>Constraints:</strong></p>\n\n<ul>\n\t<li><code>1 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>\n\t<li><code>0 &lt;= nums[i] &lt;= 10<sup>4</sup></code></li>\n\t<li><code>0 &lt;= k &lt;= 10<sup>4</sup></code></li>\n</ul>\n",
        "title": "Smallest Range I",
        "titleSlug": "smallest-range-i",
        "topicTags": [
            {
                "name": "Array",
                "id": "VG9waWNUYWdOb2RlOjU=",
                "slug": "array"
            },
            {
                "name": "Math",
                "id": "VG9waWNUYWdOb2RlOjg=",
                "slug": "math"
            }
        ]
    }
```