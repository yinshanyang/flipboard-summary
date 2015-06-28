'use strict';
var natural = require('natural'),
  SentenceTokenizer = require('sentence-tokenizer'),
  stemmer = natural.PorterStemmer,
  wordTokenizer = new natural.WordTokenizer(),
  sentenceTokenizer = new SentenceTokenizer('Chuck'),
  jaccard = require('jaccard'),
  stopwords = require('stopwords').english,
  Graph = require('ngraph.graph'),
  pagerank = require('ngraph.pagerank'),
  _ = require('lodash');

function summarize(text, n) {
  if (!text)
    return [];
  n = n || 5;
  // tokenize and stem
  // also remove stopwords
  sentenceTokenizer.setEntry(text);
  var sentences = sentenceTokenizer.getSentences(),
    stems = _(sentences)
      .map(function(sentence) {
        var words = wordTokenizer.tokenize(sentence),
          stems = _(words)
            .difference(stopwords)
            .map(function(word) { return stemmer.stem(word); })
            .value();
        return stems;
      })
      .value();

  // calculate jaccard index and adjacency matrix
  var graph = Graph();
  _(stems)
    .each(function(s, i) {
      var jaccards = _(stems)
          .map(function(_s, _i) {
            return {
              target: _i,
              jaccard: (_s === s) ? 0 : jaccard.index(s, _s)
            };
          })
          .filter(function(d) { return d.jaccard; })
          .value(),
        total = _(jaccards)
          .reduce(function(memo, d) { return memo + d.jaccard; }, 0);

      _(jaccards)
        .each(function(d) {
          var weighted = d.jaccard / total * 100;
          _(~~(weighted))
            .range()
            .each(function() {
              graph.addLink(i, d.target);
            }).value();
        }).value();
    }).value();

  var rank = pagerank(graph),
    top = _(rank)
      .map(function(score, key) {
        return {
          index: +key,
          score: score
        };
      })
      .sortBy(function(d) { return -d.score; })
      .map(function(d) {
        return sentences[d.index];
      })
      .take(n)
      .value();

  return top;
}

module.exports = {
  summarize: summarize
};