/**
 * This is a template for a state-machine rule. This rule defines
 * the set of transitions that are allowed for a custom field.
 *
 * For details, read the Quick Start Guide:
 * https://www.jetbrains.com/help/youtrack/standalone/2017.2/Quick-Start-Guide-Workflows-JS.html
 */

var entities = require('v1/entities');
var workflow = require('v1/workflow');

exports.rule = entities.Issue.stateMachine({
  title: '严格的任务状态调整约束',
  fieldName: 'State',
  states: {
    'To-do': {
      initial: true,
      transitions: {
        Doing: {
          targetState: 'Doing'
        },
        Backlog: {
          targetState: 'Backlog'
        }
      }
    },
    Doing: {
      transitions: {
        Done: {
          targetState: 'Done',
          action: function(ctx) {
            var issue = ctx.issue;
            var hasAchivment = false;
            issue.comments.forEach(function(comment) {
              hasAchivment = comment.text.indexOf('成果物') > -1;
            });
            workflow.check(hasAchivment, '需在任务评论栏中填写包含“成果物”字样的评论方可将任务状态设置为 Done ！');
          }
        }
      }
    },
    Done: {
      transitions: {
        Verified: {
          targetState: 'Verified'
        },
        Doing: {
          targetState: 'Doing'
        }
      }
    },
    Verified: {
      transitions: {
        Doing: {
          targetState: 'Doing',
          action: function(ctx) {
            var issue = ctx.issue;
            var project = issue.project;
            var hasPermission = false;
            hasPermission = issue.updatedBy.login === issue.reporter.login || issue.updatedBy.login === project.leader.login;
            workflow.check(hasPermission, '仅项目负责人 ' + project.leader.fullName + ' 和任务创建人 ' + issue.reporter.fullName + ' 可调整任务验证状态!');
          }
        }
      }
    }
  },
  requirements: {
    // TODO: add requirements
  }
});