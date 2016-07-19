React  = require 'react'
BS     = require 'react-bootstrap'
moment = require 'moment'
{ForumActions, ForumStore} = require '../../flux/forum'
ModalHeader = require 'react-bootstrap/lib/ModalHeader'
classnames = require 'classnames'
PostForm = require './post-form'
DropdownButton = require 'react-bootstrap/lib/DropdownButton'
MenuItem = require 'react-bootstrap/lib/MenuItem'


window.ForumStore = ForumStore
window.ForumActions = ForumActions

module.exports = React.createClass
  displayName: 'ForumToolbar'

  propTypes:
    courseId: React.PropTypes.string.isRequired

  getInitialState: ->
    showModal :false

  closeModal: ->
    @setState({showModal:false})

  openModal: ->
    @setState({showModal:true})

  handlePostSubmit: (newPost)->
    @setState({showModal:false})
    ForumActions.save(@props.courseId, newPost)
  renderTopicTag: (topicTag)->
    <MenuItem eventKey="1" className="toolbar-tag-menu">{topicTag}</MenuItem>

  render: ->
    classes = classnames("toolbar row")
    topicTags = ForumStore.topicTags(@props.courseId)
    chapterTags = ForumStore.chapterTags(@props.courseId)
    <div className="forum-toolbar">
      <BS.Row className={classes}>

        <BS.Col xs={9} sm={9} xsOffset={0} smOffset={0} className="toolbar-tag-col">
          <DropdownButton bsStyle='success' title='Chapters' id="chapter-tag-button">
            <MenuItem eventKey="1" className="toolbar-tag-menu">{"Chapter 1"}</MenuItem>
            <MenuItem eventKey="2" className="toolbar-tag-menu">{"Chapter 2"}</MenuItem>
            <MenuItem eventKey="3" className="toolbar-tag-menu">{"Chapter 3"}</MenuItem>
            <MenuItem eventKey="4" className="toolbar-tag-menu">{"Chapter 4"}</MenuItem>
          </DropdownButton>
          <DropdownButton bsStyle='success' title='Topics' id="topic-tag-button">
            {_.map(topicTags, @renderTopicTag)}
          </DropdownButton>
        </BS.Col>

        <BS.Col xs={3} sm={3} className="new-post-modal-col">
          <BS.Button bsStyle="primary" className="new-post-button" onClick={@openModal}>
            {"New Post"}
          </BS.Button>
          <BS.Modal className="post-form-modal" show={@state.showModal} onHide={@closeModal}>

            <ModalHeader closeButton className="post-form-header">
              <BS.Modal.Title>{"New Post"}</BS.Modal.Title>
            </ModalHeader>

            <BS.Modal.Body className="post-form-body">
              <PostForm onPostSubmit = {@handlePostSubmit} topicTags = {topicTags} chapterTags = {chapterTags}/>
            </BS.Modal.Body>

            <BS.Modal.Footer>
            </BS.Modal.Footer>

          </BS.Modal>
        </BS.Col>
      </BS.Row>
    </div>
