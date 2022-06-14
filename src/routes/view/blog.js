/**
 * @description 微博 view 路由
 * @author sylviayang
 */

const router = require('koa-router')()
const { loginRedirect } = require('../../middlewares/loginChecks')
const { getProfileBlogList } = require('../../controller/blog-profile')
const { isExist } = require('../../controller/user')

// 首页
router.get('/', loginRedirect, async (ctx, next) => {
  await ctx.render('index', {})
})

// 个人主页
router.get('/profile', loginRedirect, async (ctx, next) => {
  const { userName } = ctx.session.userInfo
  ctx.redirect(`/profile/${userName}`)
})
router.get('/profile/:userName', loginRedirect, async (ctx, next) => {
  // 已登陆用户的信息
  const myUserInfo = ctx.session.userInfo
  const myUserName = myUserInfo.userName
  
  let curUserInfo
  const { userName: curUserName } = ctx.params
  const isMe = myUserName === curUserName
  if (isMe) {
    // 是当前登陆用户
    curUserInfo = myUserInfo
  } else {
    // 不是当前登陆用户
    const existResult = await isExist(curUserName)
    // 用户名不存在
    if (existResult.errno !== 0) return
    // 用户名存在
    curUserInfo = existResult.data
  }

  // 获取第一页数据 
  const result = await getProfileBlogList(curUserName, 0)
  const { isEmpty, blogList, pageSize, pageIndex, count } = result.data

  // 获取粉丝
  

  await ctx.render('profile', {
    blogData: {
      isEmpty,
      blogList,
      pageSize,
      pageIndex,
      count
    },
    userData: {
      userInfo: curUserInfo,
      isMe
    }
  })
})

// 广场
router.get('/square', loginRedirect, async (ctx, next) => {
  const result = await getSquareBlogList(0)
  const { isEmpty, blogList, pageSize, pageIndex, count } = result.data

  await ctx.render('square', {
    blogData: {
      isEmpty,
      blogList,
      pageSize,
      pageIndex,
      count
    }
  })
})

module.exports = router