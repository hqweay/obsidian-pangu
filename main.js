'use strict';

var obsidian = require('obsidian');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

var formatUtil = {
    condenseContent(content) {
        // 将 制表符 改成 四个空格
        content = content.replace(/\t/g, '    ');
        // 删除超过2个的回车
        // Unix 的只有 LF，Windows 的需要 CR LF
        content = content.replace(/(\n){3,}/g, '$1$1');
        content = content.replace(/(\r\n){3,}/g, '$1$1');
        return content;
    },
    getIgnoreBlocks(lines, token = '```') {
        const ignoreBlocks = [];
        let block = null;
        lines.forEach((line, index) => {
            line = line.trim();
            if (line.startsWith(token)) {
                if (!block) {
                    block = { start: index, end: null };
                }
                else {
                    if (line === token) {
                        block.end = index;
                        ignoreBlocks.push(block);
                        block = null;
                    }
                }
            }
        });
        return ignoreBlocks;
    },
    deleteSpaces(content) {
        // 去掉「`()[]{}<>'"`」: 前后多余的空格
        content = content.replace(/\s+([\(\)\[\]\{\}<>'":])\s+/g, ' $1 ');
        // 去掉连续括号增加的空格，例如：「` ( [ { <  > } ] ) `」
        content = content.replace(/([<\(\{\[])\s([<\(\{\[])\s/g, '$1$2 ');
        content = content.replace(/([<\(\{\[])\s([<\(\{\[])\s/g, '$1$2 ');
        content = content.replace(/([<\(\{\[])\s([<\(\{\[])\s/g, '$1$2 ');
        content = content.replace(/([<\(\{\[])\s([<\(\{\[])\s/g, '$1$2 ');
        content = content.replace(/\s([>\)\]\}])\s([>\)\]\}])/g, ' $1$2');
        content = content.replace(/\s([>\)\]\}])\s([>\)\]\}])/g, ' $1$2');
        content = content.replace(/\s([>\)\]\}])\s([>\)\]\}])/g, ' $1$2');
        content = content.replace(/\s([>\)\]\}])\s([>\)\]\}])/g, ' $1$2');


        


        // 去掉 「`$ () $`」, 「`$ [] $`」, 「`$ {} $`」 里面增加的空格
        // 去掉开始 $ 后面增加的空格，结束 $ 前面增加的空格
        // 去掉包裹代码的符号里面增加的空格
        // 去掉开始 ` 后面增加的空格，结束 ` 前面增加的空格
        content = content.replace(/([`\$])\s*([<\(\[\{])([^\$]*)\s*([`\$])/g, '$1$2$3$4');
        content = content.replace(/([`\$])\s*([^\$]*)([>\)\]\}])\s*([`\$])/g, '$1$2$3$4');
        // 去掉「`) _`」、「`) ^`」增加的空格
        content = content.replace(/\)\s([_\^])/g, ')$1');
        // 去掉 [^footnote,2002] 中的空格
        content = content.replace(/\[\s*\^([^\]\s]*)\s*\]/g, '[^$1]');
        // 将链接的格式中文括号“[]（）”改成英文括号“[]()”，去掉增加的空格
        content = content.replace(/\s*\[\s*([^\]]+)\s*\]\s*[（(]\s*([^\s\)]*)\s*[)）]\s*/g, ' [$1]($2) ');

        // 给双链增加空格 add
        content = content.replace(/\s*\[\[\s*([^\]]+)\s*\]\]\s*/g, ' [[$1]] ');
    
        // 删除链接和中文标点的空格 add
        content = content.replace(/([\]\)])\s*([，。、《》？『』「」；：【】｛｝—！＠￥％…（）])/g, '$1$2');
        content = content.replace(/([，。、《》？『』「」；：【】｛｝—！＠￥％…（）])\s*([\[\()])/g, '$1$2');
        // 删除行首非列表的空格 add
        content = content.replace(/^\s*([\[\(])/g, '$1');

        // 将图片链接的格式中的多余空格“! []()”去掉，变成“![]()”
        content = content.replace(/!\s*\[\s*([^\]]+)\s*\]\s*[（(]\s*([^\s\)]*)\s*[)）]\s*/g, '![$1]($2) ');
        // 将网络地址中“ : // ”符号改成“://”
        content = content.replace(/\s*:\s*\/\s*\/\s*/g, '://');
        // 去掉行末空格
        content = content.replace(/(\S*)\s*$/g, '$1');


        content = content.replace(/(^-$)/g, "$1 ");



        // 去掉「123 °」和 「15 %」中的空格
        content = content.replace(/([0-9])\s*([°%])/g, '$1$2');
        // 去掉 2020 - 04 - 20, 08 : 00 : 00 这种日期时间表示的数字内的空格
        content = content.replace(/([0-9])\s*-\s*([0-9])/g, '$1-$2');
        content = content.replace(/([0-9])\s*:\s*([0-9])/g, '$1:$2');
        // 去掉 1 , 234 , 567 这种千分位表示的数字内的空格
        content = content.replace(/([0-9])\s*,\s*([0-9])/g, '$1,$2');
        // 全角標點與其他字符之間不加空格
        // 将无序列表的-后面的空格保留
        // 将有序列表的-后面的空格保留
        content = content.replace(/^(?<![-|\d.]\s*)\s*([，。、《》？『』「」；∶【】｛｝—！＠￥％…（）])\s*/g, '$1');
        return content;
    },
    insertSpace(content) {
        // 在 “中文English” 之间加入空格 “中文 English”
        // 在 “中文123” 之间加入空格 “中文 123”
        content = content.replace(/(?<!\[.*\]\(.*)([\u4e00-\u9fa5\u3040-\u30FF])([a-zA-Z0-9`])/g, '$1 $2');
        // 在 “English中文” 之间加入空格 “English 中文”
        // 在 “123中文” 之间加入空格 “123 中文”
        content = content.replace(/(?<!\[.*\]\(.*)([a-zA-Z0-9%`])([*]*[\u4e00-\u9fa5\u3040-\u30FF])/g, '$1 $2');
        // 在 「I said:it's a good news」的冒号与英文之间加入空格 「I said: it's a good news」
        content = content.replace(/([:])\s*([a-zA-z])/g, '$1 $2');
        return content;
    },
    replacePunctuations(content) {
        // `, \ . : ; ? !` 改成 `，、。：；？！`

        //... 替换为中文省略号  add
        content = content.replace(/[.]{3,}/g, "……");
        // 必须在结尾或者有空格的点才被改成句号
        content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])\.($|\s*)/g, '$1。');
        content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF]),/g, '$1，');
        content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF]);/g, '$1；');
        content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])!/g, '$1！');
        content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])\?/g, '$1？');
        content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])\\/g, '$1、');
        content = content.replace(/([\u4e00-\u9fa5\u3040-\u30FF])＼s*\:/g, '$1：');
        // 簡體中文使用直角引號
        content = content.replace(/‘/g, '『');
        content = content.replace(/’/g, '』');
        content = content.replace(/“/g, '「');
        content = content.replace(/”/g, '」');
        
        // 括号使用半角标点——为啥呀
        // 半角括号的两边都有空格就不在这里处理了，放到行中处理
        //content = content.replace(/\s*[（(]\s*/g, ' ( ');
        //content = content.replace(/\s*[）)]\s*/g, ' ) ');
        
       
        //start 2022-08  add
        content = content.replace(/\s*[（(]\s*/g, '（'); // - () 这种会被替换为 -（）
        content = content.replace(/\s*[）)]\s*/g, '）');
        
        //  content = content.replace(/[（(]/g, "（");
        //  content = content.replace(/[）)]/g, "）");
        
        //英文
        content = content.replace(/（\s*(\w)/g, " ($1");
        content = content.replace(/(\w)\s*）/g, "$1) ");

         content = content.replace(/^(-（)/g, "- （"); // fix - () 这种会被替换为 -（）

        //  content = content.replace(/\s+（/g, " （");
        //  content = content.replace(/）\s+/g, "） ");

        //end 2022-08  add
         // 英文和数字内部的全角标点 `，。；‘’“”：？！＠＃％＆－＝＋｛｝【】｜＼～`改成半角标点
        content = content.replace(/(\w)\s*，\s*(\w)/g, '$1, $2');
        content = content.replace(/(\w)\s*。\s*(\w)/g, '$1. $2');
        content = content.replace(/(\w)\s*；\s*(\w)/g, '$1; $2');
        content = content.replace(/(\w)\s*‘\s*(\w)/g, "$1 '$2");
        content = content.replace(/(\w)\s*’\s*(\w)/g, "$1' $2");
        content = content.replace(/(\w)\s*“\s*(\w)/g, '$1 "$2');
        content = content.replace(/(\w)\s*”\s*(\w)/g, '$1" $2');
        content = content.replace(/(\w)\s*：\s*(\w)/g, '$1: $2');
        content = content.replace(/(\w)\s*？\s*(\w)/g, '$1? $2');
        content = content.replace(/(\w)\s*！\s*(\w)/g, '$1! $2');
        content = content.replace(/(\w)\s*＠\s*(\w)/g, '$1@$2');
        content = content.replace(/(\w)\s*＃\s*(\w)/g, '$1#$2');
        content = content.replace(/(\w)\s*％\s*(\w)/g, '$1 % $2');
        content = content.replace(/(\w)\s*＆\s*(\w)/g, '$1 & $2');
        content = content.replace(/(\w)\s*－\s*(\w)/g, '$1 - $2');
        content = content.replace(/(\w)\s*＝\s*(\w)/g, '$1 = $2');
        content = content.replace(/(\w)\s*＋\s*(\w)/g, '$1 + $2');
        content = content.replace(/(\w)\s*｛\s*(\w)/g, '$1 {$2');
        content = content.replace(/(\w)\s*｝\s*(\w)/g, '$1} $2');
        content = content.replace(/(\w)\s*[【\[]\s*(\w)/g, '$1 [$2');
        content = content.replace(/(\w)\s*[】\]]\s*(\w)/g, '$1] $2');
        content = content.replace(/(\w)\s*｜\s*(\w)/g, '$1 | $2');
        content = content.replace(/(\w)\s*＼\s*(\w)/g, '$1  $2');
        content = content.replace(/(\w)\s*～\s*(\w)/g, '$1~$2');

         content = content.replace(/(\w)\s*「\s*(\w)/g, "$1 '$2");
         content = content.replace(/(\w)\s*」\s*(\w)/g, "$1' $2");
         content = content.replace(/(\w)\s*『\s*(\w)/g, '$1 "$2');
         content = content.replace(/(\w)\s*』\s*(\w)/g, '$1" $2');

        // 连续三个以上的 `。` 改成 `......`
        content = content.replace(/[。]{3,}/g, '……');
  
        // 截断连续超过一个的 ？和！ 为一个，「！？」也算一个
        content = content.replace(/([！？]+)\1{1,}/g, '$1');
        // 截断连续超过一个的 。，；：、“”『』〖〗《》 为一个
        content = content.replace(/([。，；：、“”『』〖〗《》【】])\1{1,}/g, '$1');
        return content;
    },
    replaceFullNumbersAndChars(content) {
        // 替换全角数字 & 全角英文
        // Ａ -> A
        // ０ -> 0
        return content.replace(/[\uFF10-\uFF19\uFF21-\uFF5A]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
    },
    formatContent(content) {
      // 替换所有的全角数字和字母为半角
      content = this.replaceFullNumbersAndChars(content);
      // 删除多余的内容（回车）
      content = this.condenseContent(content);

      // 每行操作
      const lines = content.split("\n");
      const ignoreBlocks = this.getIgnoreBlocks(lines);
      content = lines
        .map((line, index) => {
          // 忽略代码块
          if (
            ignoreBlocks.some(({ start, end }) => {
              return index >= start && index <= end;
            })
          ) {
            return line;
          }
          //中文文档内的英文标点替换为中文标点
          line = this.replacePunctuations(line);
          // 将无编号列表的“* ”改成 “- ”
          // 将无编号列表的“- ”改成 “- ”
          line = line.replace(/^(\s*)[-\*]\s+(\S)/, "$1- $2");
          // 删除多余的空格
          line = this.deleteSpaces(line);
          // 插入必要的空格
          line = this.insertSpace(line);
          // 将有编号列表的“1.  ”改成 “1. ”
          line = line.replace(/^(\s*)(\d\.)\s+(\S)/, "$1$2 $3");

          return line;
        })
        .join("\n");
      // 结束文档整理前再删除最后一个回车
      content = content.replace(/(\n){2,}$/g, "$1");
      content = content.replace(/(\r\n){2,}$/g, "$1");
      return content;
    },
};

class Pangu extends obsidian.Plugin {
    format(cm) {
        let cursor = cm.getCursor();
        let cursorContent = cm.getRange(Object.assign(Object.assign({}, cursor), { ch: 0 }), cursor);
        const { top } = cm.getScrollInfo();
        cursorContent = formatUtil.formatContent(cursorContent);
        let content = cm.getValue().trim();
        content = content + '\n\n';
        content = formatUtil.formatContent(content);
        cm.setValue(content);
        cm.scrollTo(null, top);
        // 保持光标格式化后不变
        const newDocLine = cm.getLine(cursor.line);
        try {
            cursor = Object.assign(Object.assign({}, cursor), { ch: newDocLine.indexOf(cursorContent) + cursorContent.length });
        }
        catch (error) { }
        cm.setCursor(cursor);
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            this.addCommand({
                id: 'pangu-format',
                name: '为中英文字符间自动加入空格',
                callback: () => {
                    var _a;
                    const activeLeafView = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
                    if (activeLeafView) {
                        // @ts-ignore
                        this.format((_a = activeLeafView === null || activeLeafView === void 0 ? void 0 : activeLeafView.sourceMode) === null || _a === void 0 ? void 0 : _a.cmEditor);
                    }
                },
                hotkeys: [
                    {
                        modifiers: ['Mod', 'Shift'],
                        key: 's',
                    },
                    {
                        modifiers: ['Ctrl', 'Shift'],
                        key: 's',
                    },
                ],
            });
            this.addSettingTab(new PanguSettingTab(this.app, this));
        });
    }
    onunload() {
        console.log('unloading plugin');
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
class PanguSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Pangu 使用说明' });
        new obsidian.Setting(containerEl)
            .setName('')
            .setDesc('默认快捷键为:Mac - Command + Shift + S，Windows -  Shift + Ctrl + S。当然，您可以到「设置 - 快捷键」里进行更改。');
    }
}

module.exports = Pangu;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsImZvcm1hdFV0aWwudHMiLCJtYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcclxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcclxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxyXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcclxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxyXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG4vKiBnbG9iYWwgUmVmbGVjdCwgUHJvbWlzZSAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2xhc3MgZXh0ZW5kcyB2YWx1ZSBcIiArIFN0cmluZyhiKSArIFwiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7XHJcbiAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19hc3NpZ24gPSBmdW5jdGlvbigpIHtcclxuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3Jlc3QocywgZSkge1xyXG4gICAgdmFyIHQgPSB7fTtcclxuICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSAmJiBlLmluZGV4T2YocCkgPCAwKVxyXG4gICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBwID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKTsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDAgJiYgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHMsIHBbaV0pKVxyXG4gICAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XHJcbiAgICAgICAgfVxyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2RlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XHJcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcclxuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XHJcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19wYXJhbShwYXJhbUluZGV4LCBkZWNvcmF0b3IpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2dlbmVyYXRvcih0aGlzQXJnLCBib2R5KSB7XHJcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xyXG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcclxuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cclxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2NyZWF0ZUJpbmRpbmcgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG0sIGspO1xyXG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcclxuICAgICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xyXG4gICAgfVxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcclxufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBvKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIHApKSBfX2NyZWF0ZUJpbmRpbmcobywgbSwgcCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3ZhbHVlcyhvKSB7XHJcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xyXG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XHJcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheXMoKSB7XHJcbiAgICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcclxuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcclxuICAgICAgICBmb3IgKHZhciBhID0gYXJndW1lbnRzW2ldLCBqID0gMCwgamwgPSBhLmxlbmd0aDsgaiA8IGpsOyBqKyssIGsrKylcclxuICAgICAgICAgICAgcltrXSA9IGFbal07XHJcbiAgICByZXR1cm4gcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXkodG8sIGZyb20sIHBhY2spIHtcclxuICAgIGlmIChwYWNrIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIGZvciAodmFyIGkgPSAwLCBsID0gZnJvbS5sZW5ndGgsIGFyOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGFyIHx8ICEoaSBpbiBmcm9tKSkge1xyXG4gICAgICAgICAgICBpZiAoIWFyKSBhciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20sIDAsIGkpO1xyXG4gICAgICAgICAgICBhcltpXSA9IGZyb21baV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRvLmNvbmNhdChhciB8fCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogbiA9PT0gXCJyZXR1cm5cIiB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcclxufSkgOiBmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcclxuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRHZXQocmVjZWl2ZXIsIHN0YXRlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBnZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCByZWFkIHByaXZhdGUgbWVtYmVyIGZyb20gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcclxuICAgIHJldHVybiBraW5kID09PSBcIm1cIiA/IGYgOiBraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlcikgOiBmID8gZi52YWx1ZSA6IHN0YXRlLmdldChyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBzdGF0ZSwgdmFsdWUsIGtpbmQsIGYpIHtcclxuICAgIGlmIChraW5kID09PSBcIm1cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgbWV0aG9kIGlzIG5vdCB3cml0YWJsZVwiKTtcclxuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIHNldHRlclwiKTtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHdyaXRlIHByaXZhdGUgbWVtYmVyIHRvIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4gKGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyLCB2YWx1ZSkgOiBmID8gZi52YWx1ZSA9IHZhbHVlIDogc3RhdGUuc2V0KHJlY2VpdmVyLCB2YWx1ZSkpLCB2YWx1ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRJbihzdGF0ZSwgcmVjZWl2ZXIpIHtcclxuICAgIGlmIChyZWNlaXZlciA9PT0gbnVsbCB8fCAodHlwZW9mIHJlY2VpdmVyICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiByZWNlaXZlciAhPT0gXCJmdW5jdGlvblwiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB1c2UgJ2luJyBvcGVyYXRvciBvbiBub24tb2JqZWN0XCIpO1xyXG4gICAgcmV0dXJuIHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgPT09IHN0YXRlIDogc3RhdGUuaGFzKHJlY2VpdmVyKTtcclxufVxyXG4iLCJpbnRlcmZhY2UgSWdub3JlQmxvY2sge1xuICBzdGFydDogbnVtYmVyIHwgbnVsbDtcbiAgZW5kOiBudW1iZXIgfCBudWxsO1xufVxuZXhwb3J0IGRlZmF1bHQge1xuICBjb25kZW5zZUNvbnRlbnQoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyDlsIYg5Yi26KGo56ymIOaUueaIkCDlm5vkuKrnqbrmoLxcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9cXHQvZywgJyAgICAnKTtcblxuICAgIC8vIOWIoOmZpOi2hei/hzLkuKrnmoTlm57ovaZcbiAgICAvLyBVbml4IOeahOWPquaciSBMRu+8jFdpbmRvd3Mg55qE6ZyA6KaBIENSIExGXG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvKFxcbil7Myx9L2csICckMSQxJyk7XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvKFxcclxcbil7Myx9L2csICckMSQxJyk7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH0sXG4gIGdldElnbm9yZUJsb2NrcyhsaW5lczogc3RyaW5nW10sIHRva2VuOiBzdHJpbmcgPSAnYGBgJyk6IElnbm9yZUJsb2NrW10ge1xuICAgIGNvbnN0IGlnbm9yZUJsb2NrczogSWdub3JlQmxvY2tbXSA9IFtdO1xuICAgIGxldCBibG9jazogSWdub3JlQmxvY2sgfCBudWxsID0gbnVsbDtcbiAgICBsaW5lcy5mb3JFYWNoKChsaW5lLCBpbmRleCkgPT4ge1xuICAgICAgbGluZSA9IGxpbmUudHJpbSgpO1xuICAgICAgaWYgKGxpbmUuc3RhcnRzV2l0aCh0b2tlbikpIHtcbiAgICAgICAgaWYgKCFibG9jaykge1xuICAgICAgICAgIGJsb2NrID0geyBzdGFydDogaW5kZXgsIGVuZDogbnVsbCB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChsaW5lID09PSB0b2tlbikge1xuICAgICAgICAgICAgYmxvY2suZW5kID0gaW5kZXg7XG4gICAgICAgICAgICBpZ25vcmVCbG9ja3MucHVzaChibG9jayk7XG4gICAgICAgICAgICBibG9jayA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGlnbm9yZUJsb2NrcztcbiAgfSxcbiAgZGVsZXRlU3BhY2VzKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8g5Y675o6J44CMYCgpW117fTw+J1wiYOOAjTog5YmN5ZCO5aSa5L2Z55qE56m65qC8XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvXFxzKyhbXFwoXFwpXFxbXFxdXFx7XFx9PD4nXCI6XSlcXHMrL2csICcgJDEgJyk7XG5cbiAgICAvLyDljrvmjonov57nu63mi6zlj7flop7liqDnmoTnqbrmoLzvvIzkvovlpoLvvJrjgIxgICggWyB7IDwgID4gfSBdICkgYOOAjVxuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhbPFxcKFxce1xcW10pXFxzKFs8XFwoXFx7XFxbXSlcXHMvZywgJyQxJDIgJyk7XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvKFs8XFwoXFx7XFxbXSlcXHMoWzxcXChcXHtcXFtdKVxccy9nLCAnJDEkMiAnKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oWzxcXChcXHtcXFtdKVxccyhbPFxcKFxce1xcW10pXFxzL2csICckMSQyICcpO1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhbPFxcKFxce1xcW10pXFxzKFs8XFwoXFx7XFxbXSlcXHMvZywgJyQxJDIgJyk7XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvXFxzKFs+XFwpXFxdXFx9XSlcXHMoWz5cXClcXF1cXH1dKS9nLCAnICQxJDInKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9cXHMoWz5cXClcXF1cXH1dKVxccyhbPlxcKVxcXVxcfV0pL2csICcgJDEkMicpO1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL1xccyhbPlxcKVxcXVxcfV0pXFxzKFs+XFwpXFxdXFx9XSkvZywgJyAkMSQyJyk7XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvXFxzKFs+XFwpXFxdXFx9XSlcXHMoWz5cXClcXF1cXH1dKS9nLCAnICQxJDInKTtcblxuICAgIC8vIOWOu+aOiSDjgIxgJCAoKSAkYOOAjSwg44CMYCQgW10gJGDjgI0sIOOAjGAkIHt9ICRg44CNIOmHjOmdouWinuWKoOeahOepuuagvFxuICAgIC8vIOWOu+aOieW8gOWniyAkIOWQjumdouWinuWKoOeahOepuuagvO+8jOe7k+adnyAkIOWJjemdouWinuWKoOeahOepuuagvFxuICAgIC8vIOWOu+aOieWMheijueS7o+eggeeahOespuWPt+mHjOmdouWinuWKoOeahOepuuagvFxuICAgIC8vIOWOu+aOieW8gOWniyBgIOWQjumdouWinuWKoOeahOepuuagvO+8jOe7k+adnyBgIOWJjemdouWinuWKoOeahOepuuagvFxuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoXG4gICAgICAvKFtgXFwkXSlcXHMqKFs8XFwoXFxbXFx7XSkoW15cXCRdKilcXHMqKFtgXFwkXSkvZyxcbiAgICAgICckMSQyJDMkNCdcbiAgICApO1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoXG4gICAgICAvKFtgXFwkXSlcXHMqKFteXFwkXSopKFs+XFwpXFxdXFx9XSlcXHMqKFtgXFwkXSkvZyxcbiAgICAgICckMSQyJDMkNCdcbiAgICApO1xuXG4gICAgLy8g5Y675o6J44CMYCkgX2DjgI3jgIHjgIxgKSBeYOOAjeWinuWKoOeahOepuuagvFxuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL1xcKVxccyhbX1xcXl0pL2csICcpJDEnKTtcblxuICAgIC8vIOWOu+aOiSBbXmZvb3Rub3RlLDIwMDJdIOS4reeahOepuuagvFxuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL1xcW1xccypcXF4oW15cXF1cXHNdKilcXHMqXFxdL2csICdbXiQxXScpO1xuXG4gICAgLy8g5bCG6ZO+5o6l55qE5qC85byP5Lit5paH5ous5Y+34oCcW13vvIjvvInigJ3mlLnmiJDoi7Hmlofmi6zlj7figJxbXSgp4oCd77yM5Y675o6J5aKe5Yqg55qE56m65qC8XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShcbiAgICAgIC9cXHMqXFxbXFxzKihbXlxcXV0rKVxccypcXF1cXHMqW++8iChdXFxzKihbXlxcc1xcKV0qKVxccypbKe+8iV1cXHMqL2csXG4gICAgICAnIFskMV0oJDIpICdcbiAgICApO1xuXG4gICAgLy8g5bCG5Zu+54mH6ZO+5o6l55qE5qC85byP5Lit55qE5aSa5L2Z56m65qC84oCcISBbXSgp4oCd5Y675o6J77yM5Y+Y5oiQ4oCcIVtdKCnigJ1cbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKFxuICAgICAgLyFcXHMqXFxbXFxzKihbXlxcXV0rKVxccypcXF1cXHMqW++8iChdXFxzKihbXlxcc1xcKV0qKVxccypbKe+8iV1cXHMqL2csXG4gICAgICAnIVskMV0oJDIpICdcbiAgICApO1xuXG4gICAgLy8g5bCG572R57uc5Zyw5Z2A5Lit4oCcIDogLy8g4oCd56ym5Y+35pS55oiQ4oCcOi8v4oCdXG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvXFxzKjpcXHMqXFwvXFxzKlxcL1xccyovZywgJzovLycpO1xuXG4gICAgLy8g5Y675o6J6KGM5pyr56m65qC8XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvKFxcUyopXFxzKiQvZywgJyQxJyk7XG5cbiAgICAvLyDljrvmjonjgIwxMjMgwrDjgI3lkowg44CMMTUgJeOAjeS4reeahOepuuagvFxuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhbMC05XSlcXHMqKFvCsCVdKS9nLCAnJDEkMicpO1xuXG4gICAgLy8g5Y675o6JIDIwMjAgLSAwNCAtIDIwLCAwOCA6IDAwIDogMDAg6L+Z56eN5pel5pyf5pe26Ze06KGo56S655qE5pWw5a2X5YaF55qE56m65qC8XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvKFswLTldKVxccyotXFxzKihbMC05XSkvZywgJyQxLSQyJyk7XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvKFswLTldKVxccyo6XFxzKihbMC05XSkvZywgJyQxOiQyJyk7XG5cbiAgICAvLyDljrvmjokgMSAsIDIzNCAsIDU2NyDov5nnp43ljYPliIbkvY3ooajnpLrnmoTmlbDlrZflhoXnmoTnqbrmoLxcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oWzAtOV0pXFxzKixcXHMqKFswLTldKS9nLCAnJDEsJDInKTtcblxuICAgIC8vIOWFqOinkuaomem7nuiIh+WFtuS7luWtl+espuS5i+mWk+S4jeWKoOepuuagvFxuICAgIC8vIOWwhuaXoOW6j+WIl+ihqOeahC3lkI7pnaLnmoTnqbrmoLzkv53nlZlcbiAgICAvLyDlsIbmnInluo/liJfooajnmoQt5ZCO6Z2i55qE56m65qC85L+d55WZXG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShcbiAgICAgIC9eKD88IVstfFxcZC5dXFxzKilcXHMqKFvvvIzjgILjgIHjgIrjgIvvvJ/jgI7jgI/jgIzjgI3vvJviiLbjgJDjgJHvvZvvvZ3igJTvvIHvvKDvv6XvvIXigKbvvIjvvIldKVxccyovZyxcbiAgICAgICckMSdcbiAgICApO1xuICAgIHJldHVybiBjb250ZW50O1xuICB9LFxuXG4gIGluc2VydFNwYWNlKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8g5ZyoIOKAnOS4reaWh0VuZ2xpc2jigJ0g5LmL6Ze05Yqg5YWl56m65qC8IOKAnOS4reaWhyBFbmdsaXNo4oCdXG4gICAgLy8g5ZyoIOKAnOS4reaWhzEyM+KAnSDkuYvpl7TliqDlhaXnqbrmoLwg4oCc5Lit5paHIDEyM+KAnVxuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoXG4gICAgICAvKD88IVxcWy4qXFxdXFwoLiopKFtcXHU0ZTAwLVxcdTlmYTVcXHUzMDQwLVxcdTMwRkZdKShbYS16QS1aMC05YF0pL2csXG4gICAgICAnJDEgJDInXG4gICAgKTtcblxuICAgIC8vIOWcqCDigJxFbmdsaXNo5Lit5paH4oCdIOS5i+mXtOWKoOWFpeepuuagvCDigJxFbmdsaXNoIOS4reaWh+KAnVxuICAgIC8vIOWcqCDigJwxMjPkuK3mlofigJ0g5LmL6Ze05Yqg5YWl56m65qC8IOKAnDEyMyDkuK3mlofigJ1cbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKFxuICAgICAgLyg/PCFcXFsuKlxcXVxcKC4qKShbYS16QS1aMC05JWBdKShbKl0qW1xcdTRlMDAtXFx1OWZhNVxcdTMwNDAtXFx1MzBGRl0pL2csXG4gICAgICAnJDEgJDInXG4gICAgKTtcblxuICAgIC8vIOWcqCDjgIxJIHNhaWQ6aXQncyBhIGdvb2QgbmV3c+OAjeeahOWGkuWPt+S4juiLseaWh+S5i+mXtOWKoOWFpeepuuagvCDjgIxJIHNhaWQ6IGl0J3MgYSBnb29kIG5ld3PjgI1cbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oWzpdKVxccyooW2EtekEtel0pL2csICckMSAkMicpO1xuXG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH0sXG4gIHJlcGxhY2VQdW5jdHVhdGlvbnMoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBgLCBcXCAuIDogOyA/ICFgIOaUueaIkCBg77yM44CB44CC77ya77yb77yf77yBYFxuICAgIC8vIOW/hemhu+WcqOe7k+WwvuaIluiAheacieepuuagvOeahOeCueaJjeiiq+aUueaIkOWPpeWPt1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoXG4gICAgICAvKFtcXHU0ZTAwLVxcdTlmYTVcXHUzMDQwLVxcdTMwRkZdKVxcLigkfFxccyopL2csXG4gICAgICAnJDHjgIInXG4gICAgKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oW1xcdTRlMDAtXFx1OWZhNVxcdTMwNDAtXFx1MzBGRl0pLC9nLCAnJDHvvIwnKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oW1xcdTRlMDAtXFx1OWZhNVxcdTMwNDAtXFx1MzBGRl0pOy9nLCAnJDHvvJsnKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oW1xcdTRlMDAtXFx1OWZhNVxcdTMwNDAtXFx1MzBGRl0pIS9nLCAnJDHvvIEnKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oW1xcdTRlMDAtXFx1OWZhNVxcdTMwNDAtXFx1MzBGRl0pXFw/L2csICckMe+8nycpO1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhbXFx1NGUwMC1cXHU5ZmE1XFx1MzA0MC1cXHUzMEZGXSlcXFxcL2csICckMeOAgScpO1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhbXFx1NGUwMC1cXHU5ZmE1XFx1MzA0MC1cXHUzMEZGXSnvvLxzKlxcOi9nLCAnJDHvvJonKTtcblxuICAgIC8vIOewoemrlOS4reaWh+S9v+eUqOebtOinkuW8leiZn1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL+KAmC9nLCAn44COJyk7XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgv4oCZL2csICfjgI8nKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC/igJwvZywgJ+OAjCcpO1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL+KAnS9nLCAn44CNJyk7XG4gICAgLy8g5ous5Y+35L2/55So5Y2K6KeS5qCH54K5XG4gICAgLy8g5Y2K6KeS5ous5Y+355qE5Lik6L656YO95pyJ56m65qC85bCx5LiN5Zyo6L+Z6YeM5aSE55CG5LqG77yM5pS+5Yiw6KGM5Lit5aSE55CGXG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvXFxzKlvvvIgoXVxccyovZywgJyAoICcpO1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL1xccypb77yJKV1cXHMqL2csICcgKSAnKTtcblxuICAgIC8vIOiLseaWh+WSjOaVsOWtl+WGhemDqOeahOWFqOinkuagh+eCuSBg77yM44CC77yb4oCY4oCZ4oCc4oCd77ya77yf77yB77yg77yD77yF77yG77yN77yd77yL772b772d44CQ44CR772c77y8772eYOaUueaIkOWNiuinkuagh+eCuVxuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhcXHcpXFxzKu+8jFxccyooXFx3KS9nLCAnJDEsICQyJyk7XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvKFxcdylcXHMq44CCXFxzKihcXHcpL2csICckMS4gJDInKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oXFx3KVxccyrvvJtcXHMqKFxcdykvZywgJyQxOyAkMicpO1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhcXHcpXFxzKuKAmFxccyooXFx3KS9nLCBcIiQxICckMlwiKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oXFx3KVxccyrigJlcXHMqKFxcdykvZywgXCIkMScgJDJcIik7XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvKFxcdylcXHMq4oCcXFxzKihcXHcpL2csICckMSBcIiQyJyk7XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvKFxcdylcXHMq4oCdXFxzKihcXHcpL2csICckMVwiICQyJyk7XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvKFxcdylcXHMq77yaXFxzKihcXHcpL2csICckMTogJDInKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oXFx3KVxccyrvvJ9cXHMqKFxcdykvZywgJyQxPyAkMicpO1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhcXHcpXFxzKu+8gVxccyooXFx3KS9nLCAnJDEhICQyJyk7XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvKFxcdylcXHMq77ygXFxzKihcXHcpL2csICckMUAkMicpO1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhcXHcpXFxzKu+8g1xccyooXFx3KS9nLCAnJDEjJDInKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oXFx3KVxccyrvvIVcXHMqKFxcdykvZywgJyQxICUgJDInKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oXFx3KVxccyrvvIZcXHMqKFxcdykvZywgJyQxICYgJDInKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oXFx3KVxccyrvvI1cXHMqKFxcdykvZywgJyQxIC0gJDInKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oXFx3KVxccyrvvJ1cXHMqKFxcdykvZywgJyQxID0gJDInKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oXFx3KVxccyrvvItcXHMqKFxcdykvZywgJyQxICsgJDInKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oXFx3KVxccyrvvZtcXHMqKFxcdykvZywgJyQxIHskMicpO1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhcXHcpXFxzKu+9nVxccyooXFx3KS9nLCAnJDF9ICQyJyk7XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvKFxcdylcXHMqW+OAkFxcW11cXHMqKFxcdykvZywgJyQxIFskMicpO1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhcXHcpXFxzKlvjgJFcXF1dXFxzKihcXHcpL2csICckMV0gJDInKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oXFx3KVxccyrvvZxcXHMqKFxcdykvZywgJyQxIHwgJDInKTtcbiAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oXFx3KVxccyrvvLxcXHMqKFxcdykvZywgJyQxICAkMicpO1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhcXHcpXFxzKu+9nlxccyooXFx3KS9nLCAnJDF+JDInKTtcbiAgICAvLyDov57nu63kuInkuKrku6XkuIrnmoQgYOOAgmAg5pS55oiQIGAuLi4uLi5gXG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvW+OAgl17Myx9L2csICfigKbigKYnKTtcbiAgICAvLyDmiKrmlq3ov57nu63otoXov4fkuIDkuKrnmoQg77yf5ZKM77yBIOS4uuS4gOS4qu+8jOOAjO+8ge+8n+OAjeS5n+eul+S4gOS4qlxuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhb77yB77yfXSspXFwxezEsfS9nLCAnJDEnKTtcbiAgICAvLyDmiKrmlq3ov57nu63otoXov4fkuIDkuKrnmoQg44CC77yM77yb77ya44CB4oCc4oCd44CO44CP44CW44CX44CK44CLIOS4uuS4gOS4qlxuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhb44CC77yM77yb77ya44CB4oCc4oCd44CO44CP44CW44CX44CK44CL44CQ44CRXSlcXDF7MSx9L2csICckMScpO1xuICAgIHJldHVybiBjb250ZW50O1xuICB9LFxuXG4gIHJlcGxhY2VGdWxsTnVtYmVyc0FuZENoYXJzKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8g5pu/5o2i5YWo6KeS5pWw5a2XICYg5YWo6KeS6Iux5paHXG4gICAgLy8g77yhIC0+IEFcbiAgICAvLyDvvJAgLT4gMFxuICAgIHJldHVybiBjb250ZW50LnJlcGxhY2UoL1tcXHVGRjEwLVxcdUZGMTlcXHVGRjIxLVxcdUZGNUFdL2csIGMgPT5cbiAgICAgIFN0cmluZy5mcm9tQ2hhckNvZGUoYy5jaGFyQ29kZUF0KDApIC0gMHhmZWUwKVxuICAgICk7XG4gIH0sXG5cbiAgZm9ybWF0Q29udGVudChjb250ZW50OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIOabv+aNouaJgOacieeahOWFqOinkuaVsOWtl+WSjOWtl+avjeS4uuWNiuinklxuICAgIGNvbnRlbnQgPSB0aGlzLnJlcGxhY2VGdWxsTnVtYmVyc0FuZENoYXJzKGNvbnRlbnQpO1xuXG4gICAgLy8g5Yig6Zmk5aSa5L2Z55qE5YaF5a6577yI5Zue6L2m77yJXG4gICAgY29udGVudCA9IHRoaXMuY29uZGVuc2VDb250ZW50KGNvbnRlbnQpO1xuXG4gICAgLy8g5q+P6KGM5pON5L2cXG4gICAgY29uc3QgbGluZXMgPSBjb250ZW50LnNwbGl0KCdcXG4nKTtcblxuICAgIGNvbnN0IGlnbm9yZUJsb2NrczogSWdub3JlQmxvY2tbXSA9IHRoaXMuZ2V0SWdub3JlQmxvY2tzKGxpbmVzKTtcblxuICAgIGNvbnRlbnQgPSBsaW5lc1xuICAgICAgLm1hcCgobGluZTogc3RyaW5nLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIC8vIOW/veeVpeS7o+eggeWdl1xuICAgICAgICBpZiAoXG4gICAgICAgICAgaWdub3JlQmxvY2tzLnNvbWUoKHsgc3RhcnQsIGVuZCB9KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gaW5kZXggPj0gc3RhcnQgJiYgaW5kZXggPD0gZW5kO1xuICAgICAgICAgIH0pXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybiBsaW5lO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5Yig6Zmk5aSa5L2Z55qE56m65qC8XG4gICAgICAgIGxpbmUgPSB0aGlzLmRlbGV0ZVNwYWNlcyhsaW5lKTtcblxuICAgICAgICAvLyDmj5LlhaXlv4XopoHnmoTnqbrmoLxcbiAgICAgICAgbGluZSA9IHRoaXMuaW5zZXJ0U3BhY2UobGluZSk7XG5cbiAgICAgICAgLy8g5bCG5pyJ57yW5Y+35YiX6KGo55qE4oCcMS4gIOKAneaUueaIkCDigJwxLiDigJ1cbiAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSgvXihcXHMqKShcXGRcXC4pXFxzKyhcXFMpLywgJyQxJDIgJDMnKTtcblxuICAgICAgICAvLyDlsIbml6DnvJblj7fliJfooajnmoTigJwqIOKAneaUueaIkCDigJwtIOKAnVxuICAgICAgICAvLyDlsIbml6DnvJblj7fliJfooajnmoTigJwtIOKAneaUueaIkCDigJwtIOKAnVxuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKC9eKFxccyopWy1cXCpdXFxzKyhcXFMpLywgJyQxLSAkMicpO1xuXG4gICAgICAgIHJldHVybiBsaW5lO1xuICAgICAgfSlcbiAgICAgIC5qb2luKCdcXG4nKTtcblxuICAgIC8vIOe7k+adn+aWh+aho+aVtOeQhuWJjeWGjeWIoOmZpOacgOWQjuS4gOS4quWbnui9plxuICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoLyhcXG4pezIsfSQvZywgJyQxJyk7XG4gICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvKFxcclxcbil7Mix9JC9nLCAnJDEnKTtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfSxcbn07XG4iLCJpbXBvcnQgeyBBcHAsIFBsdWdpbiwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZywgTWFya2Rvd25WaWV3IH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5pbXBvcnQgZm9ybWF0VXRpbCBmcm9tICcuL2Zvcm1hdFV0aWwnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFuZ3UgZXh0ZW5kcyBQbHVnaW4ge1xyXG4gIGZvcm1hdChjbTogQ29kZU1pcnJvci5FZGl0b3IpOiB2b2lkIHtcclxuICAgIGxldCBjdXJzb3IgPSBjbS5nZXRDdXJzb3IoKTtcclxuICAgIGxldCBjdXJzb3JDb250ZW50ID0gY20uZ2V0UmFuZ2UoeyAuLi5jdXJzb3IsIGNoOiAwIH0sIGN1cnNvcik7XHJcbiAgICBjb25zdCB7IHRvcCB9ID0gY20uZ2V0U2Nyb2xsSW5mbygpO1xyXG5cclxuICAgIGN1cnNvckNvbnRlbnQgPSBmb3JtYXRVdGlsLmZvcm1hdENvbnRlbnQoY3Vyc29yQ29udGVudCk7XHJcblxyXG4gICAgbGV0IGNvbnRlbnQgPSBjbS5nZXRWYWx1ZSgpLnRyaW0oKTtcclxuICAgIGNvbnRlbnQgPSBjb250ZW50ICsgJ1xcblxcbic7XHJcbiAgICBjb250ZW50ID0gZm9ybWF0VXRpbC5mb3JtYXRDb250ZW50KGNvbnRlbnQpO1xyXG5cclxuICAgIGNtLnNldFZhbHVlKGNvbnRlbnQpO1xyXG5cclxuICAgIGNtLnNjcm9sbFRvKG51bGwsIHRvcCk7XHJcblxyXG4gICAgLy8g5L+d5oyB5YWJ5qCH5qC85byP5YyW5ZCO5LiN5Y+YXHJcbiAgICBjb25zdCBuZXdEb2NMaW5lID0gY20uZ2V0TGluZShjdXJzb3IubGluZSk7XHJcbiAgICB0cnkge1xyXG4gICAgICBjdXJzb3IgPSB7XHJcbiAgICAgICAgLi4uY3Vyc29yLFxyXG4gICAgICAgIGNoOiBuZXdEb2NMaW5lLmluZGV4T2YoY3Vyc29yQ29udGVudCkgKyBjdXJzb3JDb250ZW50Lmxlbmd0aCxcclxuICAgICAgfTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxyXG5cclxuICAgIGNtLnNldEN1cnNvcihjdXJzb3IpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgb25sb2FkKCkge1xyXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcclxuICAgICAgaWQ6ICdwYW5ndS1mb3JtYXQnLFxyXG4gICAgICBuYW1lOiAn5Li65Lit6Iux5paH5a2X56ym6Ze06Ieq5Yqo5Yqg5YWl56m65qC8JyxcclxuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcclxuICAgICAgICBjb25zdCBhY3RpdmVMZWFmVmlldyA9XHJcbiAgICAgICAgICB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xyXG4gICAgICAgIGlmIChhY3RpdmVMZWFmVmlldykge1xyXG4gICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgdGhpcy5mb3JtYXQoYWN0aXZlTGVhZlZpZXc/LnNvdXJjZU1vZGU/LmNtRWRpdG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGhvdGtleXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBtb2RpZmllcnM6IFsnTW9kJywgJ1NoaWZ0J10sXHJcbiAgICAgICAgICBrZXk6ICdzJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIG1vZGlmaWVyczogWydDdHJsJywgJ1NoaWZ0J10sXHJcbiAgICAgICAgICBrZXk6ICdzJyxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBQYW5ndVNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcclxuICB9XHJcblxyXG4gIG9udW5sb2FkKCkge1xyXG4gICAgY29uc29sZS5sb2coJ3VubG9hZGluZyBwbHVnaW4nKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGxvYWRTZXR0aW5ncygpIHt9XHJcbn1cclxuXHJcbmNsYXNzIFBhbmd1U2V0dGluZ1RhYiBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xyXG4gIHBsdWdpbjogUGFuZ3U7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IFBhbmd1KSB7XHJcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XHJcbiAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcclxuICB9XHJcblxyXG4gIGRpc3BsYXkoKTogdm9pZCB7XHJcbiAgICBsZXQgeyBjb250YWluZXJFbCB9ID0gdGhpcztcclxuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XHJcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdQYW5ndSDkvb/nlKjor7TmmI4nIH0pO1xyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKCcnKVxyXG4gICAgICAuc2V0RGVzYyhcclxuICAgICAgICAn6buY6K6k5b+r5o236ZSu5Li6Ok1hYyAtIENvbW1hbmQgKyBTaGlmdCArIFPvvIxXaW5kb3dzIC0gIFNoaWZ0ICsgQ3RybCArIFPjgILlvZPnhLbvvIzmgqjlj6/ku6XliLDjgIzorr7nva4gLSDlv6vmjbfplK7jgI3ph4zov5vooYzmm7TmlLnjgIInXHJcbiAgICAgICk7XHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6WyJQbHVnaW4iLCJNYXJrZG93blZpZXciLCJQbHVnaW5TZXR0aW5nVGFiIiwiU2V0dGluZyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUF1REE7QUFDTyxTQUFTLFNBQVMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUU7QUFDN0QsSUFBSSxTQUFTLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEtBQUssWUFBWSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLFVBQVUsT0FBTyxFQUFFLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDaEgsSUFBSSxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDL0QsUUFBUSxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMs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T0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDNUQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDNUQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekQsT0FBTyxHQUFHLE9BQU8sQ0FB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
