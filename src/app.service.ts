import { Injectable, HttpService } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { writeFileSync, write } from 'fs';
import { forkJoin, of } from 'rxjs';
import data from '../data/result.json';

@Injectable()
export class AppService {
  private questionsList = [];
  constructor(private http: HttpService) {}

  getQuestions() {
    return this.http.get('https://leetcode.com/api/problems/all/').pipe(
      map(response => {
        this.questionsList = response.data.stat_status_pairs.map(e => ({
          id: e.stat.question_id,
          slug: e.stat.question__title_slug,
        }));
        if (data && (data as Array<any>).length !== this.questionsList.length) {
          this.updateLikesAndDislikes();
        }
        return response.data;
      }),
    );
  }

  getLikesAndDislikesFromDisk() {
    return data;
  }

  getLikesAndDislikesFromURL() {
    const list = this.questionsList.map(e => {
      return this.http.post('https://leetcode.com/graphql', {
        operationName: 'questionData',
        variables: { titleSlug: e.slug },
        query:
          'query questionData($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    questionId\n    questionFrontendId\n    boundTopicId\n    title\n    titleSlug\n    content\n    translatedTitle\n    translatedContent\n    isPaidOnly\n    difficulty\n    likes\n    dislikes\n    isLiked\n    similarQuestions\n    contributors {\n      username\n      profileUrl\n      avatarUrl\n      __typename\n    }\n    langToValidPlayground\n    topicTags {\n      name\n      slug\n      translatedName\n      __typename\n    }\n    companyTagStats\n    codeSnippets {\n      lang\n      langSlug\n      code\n      __typename\n    }\n    stats\n    hints\n    solution {\n      id\n      canSeeDetail\n      __typename\n    }\n    status\n    sampleTestCase\n    metaData\n    judgerAvailable\n    judgeType\n    mysqlSchemas\n    enableRunCode\n    enableTestMode\n    envInfo\n    libraryUrl\n    __typename\n  }\n}\n',
      });
    });
    return forkJoin(list)
      .pipe(map(res => res.map(e => e.data)))
      .pipe(map(res => res.map(e => e.data)))
      .pipe(map(res => res.map(e => e.question)));
  }

  updateLikesAndDislikes() {
    this.getLikesAndDislikesFromURL().subscribe(data => {
      const list = data.map(e => ({
        id: e.questionId,
        titleSlug: e.titleSlug,
        likes: e.likes,
        dislikes: e.dislikes,
      }));
      writeFileSync('data/result.json', JSON.stringify(list));
    });
  }
}
