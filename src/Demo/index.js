import React, { Component } from 'react';
import './index.scss'


class Demo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [
        {
          id: 0,
          text: '向'
        },
        {
          id: 1,
          text: '我'
        },
        {
          id: 2,
          text: '你'
        },
        {
          id: 3,
          text: '他'
        },
        {
          id: 4,
          text: '小'
        },
        {
          id: 5,
          text: '飞'
        },
        {
          id: 6,
          text: '李'
        },
        {
          id: 7,
          text: '王'
        },
        {
          id: 8,
          text: '二'
        },
        {
          id: 9,
          text: '张'
        },
        {
          id: 10,
          text: '哈'
        },
      ], 
    }
  }
  clickItem = (item) => { 
    let {list} = this.state
    list = this.mapList(list, item.id) 
    const selectedList = this.eachList(list) 
    if(selectedList.length === 2){
      let mergeObj = this.merge(selectedList)
      list = this.replace(list, mergeObj)
      list = this.delelteOne(list, selectedList[1].id)
    } 


    this.setState({list})
  }
  // 鼠标悬浮
  onMouseOver = (item) => {
    if(!item.isMerged) return; 
    this.setHover(item, true) 
  }
  // 鼠标移入
  onMouseEnter = (item) => {
    if(!item.isMerged) return;  
    this.setHover(item, true)
  }
  // 鼠标移出
  onMouseLeave = (item) => {
    if(!item.isMerged) return;  
    this.setHover(item, false)
  }
  // 显示拆分
  setHover = (hoverItem, boo) => {
    const {list} = this.state 
    let index = list.findIndex(item => item.id === hoverItem.id ) 
    list[index].hovered = boo
    this.setState({list})
  }
  // 遍历list 设置选中状态
  mapList = (list, id) => {
    list = list.map(item => { 
      if(item.id === id){
        return {
          ...item,
          selected: !item.selected,
        }
      }
      return {
        ...item, 
      }
    })  
    return list;
  } 
  // 遍历list 找出选中的两个 
  eachList = (list) => {
    return list.filter(item => item.selected)
  }
  // 合并
  merge = (selectedList) => {
    let res = {
      id: selectedList[0].id,
      seleced: false, 
      isMerged: true, 
      text: (
        <div className='merge'>
          <div className='item'  >{selectedList[0].text}</div>
          <div className='item'  >{selectedList[1].text}</div> 
        </div>
      ),
      format: [selectedList[0], selectedList[1]],
      left: selectedList[0],
      right: selectedList[1] 
    }
    console.log(res)
    return res 
  }
  // 将合并的对象进行替换  
  replace = (list, mergeObj) => {
    let index = list.findIndex(item => item.id === mergeObj.id)
    list[index] = mergeObj 
    return list;
  } 
  //替换后从数据中删除一个
  delelteOne = (list, id) => {
    let index = list.findIndex(item => item.id === id)
    list.splice(index, 1)
    return list;
  } 
  // 点击拆分
  clickSplit = (e, splitObj) => { 
    e.stopPropagation()
    let {list} = this.state
    const index = list.findIndex(item => item.id === splitObj.id)
    const [left, right] =  this.split(splitObj)
    console.log([left, right])
    list = this.inset(list, left, right, index) 
    this.setState({list})
  }
   // 拆分 
  split = (splitObj) => {
    if(!splitObj.isMerged) return;
    return [splitObj.left, splitObj.right]
  }
  // 拆分后插入
  inset = (list, left, right, index) => {
    left.selected = false
    right.selected = false
    list.splice(index, 1, left, right)  
    return list;
  }
  formatList = (result = [], list = []) => { 
    console.log(list)
    // list.reduce((per, cur) => {
    //   if(cur.left){
    //     this.formatList(per, [cur.left, cur.right])
    //   }else{
    //     cur.concat([cur])
    //   } 
    //   return per;
    // }, result) 
    // return result; 
  }
  render() {
    const {list} = this.state
    return (
      <div className='demo'>
        <div className="list">
          {
            list.map(item=> (
              <div 
                key={item.id} 
                className={`item ${item.selected ? 'selected' : ''}`} 
                onMouseOver={ () => this.onMouseOver(item)} 
                onMouseEnter={() => this.onMouseEnter(item)}
                onMouseLeave={() => this.onMouseLeave(item)}
                onClick={() => this.clickItem(item)}
              >
                {item.text}
                {
                  item.hovered && item.isMerged && <a className='split' onClick={ e => this.clickSplit(e, item)}>拆分</a>
                } 
              </div> 
            ))
          }
        </div>
        <button onClick={() => this.formatList([], this.state.list)}>格式化数据</button> 
      </div>
    );
  }
}

export default Demo;