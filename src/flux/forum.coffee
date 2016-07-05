{CrudConfig, makeSimpleStore, extendConfig} = require './helpers'
{TimeStore} = require './time'
_ = require 'underscore'
moment = require 'moment'

ForumConfig = {

  _saved: (obj, courseId) ->
    forum = @_get(courseId)

    if `Object.keys(obj).length ==5`
      obj.id = forum.posts.length + 1
      obj.comments = []
      forum.posts.push(obj)

    if `Object.keys(obj).length ==4`
      obj.id = forum.posts[obj.postid-1].comments.length + 1
      obj.author= 'Johny Tran'
      forum.posts[obj.postid-1].comments.push(obj)


    return forum


  exports:

    isDeleted: (post) -> post.is_deleted

    posts: (courseId) ->
      data = @_get(courseId)
      posts = data.posts or []

    postsByRecent: (courseId) ->
      posts = this.exports.posts.call(this, courseId)
      _.sortBy(posts, 'post_date').reverse()
}

extendConfig(ForumConfig, new CrudConfig())
{actions, store} = makeSimpleStore(ForumConfig)
module.exports = {ForumActions:actions, ForumStore:store}
