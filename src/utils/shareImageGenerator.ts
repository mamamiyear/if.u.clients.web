
export interface ShareData {
  // 1. 照片
  imageBlob: Blob;

  // 2. 标签区 (左下)
  tags: {
    assets: string;       // 资产等级 (A6, A7...)
    liquidAssets: string; // 流动资产 (C6, C7...)
    income: string;       // 收入 (50万)
  };

  // 3. 信息区 (右上)
  basicInfo: {
    age: string;    // 30岁
    height: string; // 175cm
    degree: string; // 本科
  };
  details: {
    city: string;        // 常住城市
    isSingleChild: string; // 是/否/-
    houseCar: string;    // 有房有贷; 有车无贷
  };
  introduction: string; // 详细介绍文本

  // 4. 红娘区 (右下)
  matchmaker: {
    orgName: string; // IF.U
    name: string;    // 红娘昵称
  };
}

export const generateShareImage = (data: ShareData): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(data.imageBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not supported'));
        return;
      }

      // 1. 设置画布尺寸 960x540
      const totalWidth = 960;
      const totalHeight = 540;
      
      canvas.width = totalWidth;
      canvas.height = totalHeight;

      // 填充白色背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ==========================================
      // 1. 左上：照片区域 (0, 0, 480, 480)
      // ==========================================
      const photoSize = 480;
      // 绘制照片，缩放至 480x480
      ctx.save();
      // 绘制圆角遮罩（如果需要圆角，用户示意图左上角似乎是直角，只有整个卡片可能有圆角，这里先直角）
      ctx.drawImage(img, 0, 0, photoSize, photoSize);
      
      // 添加一个内阴影或边框让照片更清晰（可选，参考示意图有浅蓝边框）
      ctx.strokeStyle = '#d9e8ff'; // 浅蓝色边框
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, photoSize, photoSize);
      
      // 左上角 "照片" 字样 (已移除)
      ctx.restore();

      // ==========================================
      // 2. 左下：标签区域 (0, 480, 480, 60)
      // ==========================================
      const tagAreaY = 480;
      const tagAreaHeight = 60;
      
      // 区域宽 480，平均分给3个标签
      // 左右留白 20px -> 可用 440
      // 间距 20px * 2 = 40
      // 标签宽 (440 - 40) / 3 = 133.33 -> 取 130
      const tagWidth = 130;
      const tagHeight = 40; // 略微加高
      const tagY = tagAreaY + (tagAreaHeight - tagHeight) / 2;
      
      // 标签配置
      const tags = [
        { label: data.tags.assets || '-', bg: '#E6E6FA' },       // 资产 - 淡紫
        { label: data.tags.liquidAssets || '-', bg: '#E6E6FA' }, // 流动 - 淡紫
        { label: data.tags.income || '-', bg: '#E6E6FA' }        // 收入 - 淡紫
      ];

      // 计算起始 X，居中排列
      // 总宽 480, 内容宽 3 * 130 + 2 * 20 = 390 + 40 = 430
      // 剩余 50, padding-left 25
      const startX = 25;
      const gap = 20;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // 字体适当调大
      ctx.font = 'bold 18px sans-serif';

      tags.forEach((tag, index) => {
        const x = startX + index * (tagWidth + gap);
        
        // 绘制胶囊背景
        ctx.fillStyle = tag.bg;
        ctx.beginPath();
        ctx.roundRect(x, tagY, tagWidth, tagHeight, tagHeight / 2);
        ctx.fill();
        
        // 绘制黑色边框
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 绘制文字
        ctx.fillStyle = '#000000';
        ctx.fillText(tag.label, x + tagWidth / 2, tagY + tagHeight / 2 + 1);
      });
      ctx.restore();

      // ==========================================
      // 3. 右上：信息区域 (480, 0, 480, 480)
      // ==========================================
      const infoX = 480;
      
      // 3.1 顶部三个便签 (年龄, 身高, 学历)
      // y: 30
      const noteY = 30;
      // 宽度增加
      const noteWidth = 130;
      const noteHeight = 50;
      const noteGap = 20;
      // 480 - (130*3 + 20*2) = 480 - 430 = 50, padding 25
      const noteStartX = infoX + 25; 

      const notes = [
        { label: data.basicInfo.age || '-', title: '年龄' },
        { label: data.basicInfo.height || '-', title: '身高' },
        { label: data.basicInfo.degree || '-', title: '学历' }
      ];

      ctx.save();
      notes.forEach((note, index) => {
        const x = noteStartX + index * (noteWidth + noteGap);
        
        // 模拟便签纸样式 (淡黄色背景 + 阴影)
        ctx.fillStyle = '#FFF8DC'; // Cornsilk
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.beginPath();
        // 简单矩形
        ctx.fillRect(x, noteY, noteWidth, noteHeight);
        
        // 清除阴影绘制边框
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#DAA520'; // GoldenRod
        ctx.lineWidth = 1;
        ctx.strokeRect(x, noteY, noteWidth, noteHeight);

        // 绘制文字
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // 字体不变或微调，需求说信息显示区文字大小可以不变，但便签比较大，稍微大一点点好看
        ctx.font = 'bold 20px sans-serif'; 
        ctx.fillText(note.label, x + noteWidth / 2, noteY + noteHeight / 2);
      });
      ctx.restore();

      // 3.2 列表信息 (城市, 独生, 房车)
      // y 从 120 开始 (noteY + noteHeight + gap)
      let currentY = 130;
      const labelX = infoX + 40;
      const valueX = infoX + 160;
      const lineHeight = 50; // 行高增加

      ctx.save();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      const listItems = [
        { label: '【城市】', value: data.details.city || '常住城市' },
        { label: '【独生子女】', value: data.details.isSingleChild || '-' },
        { label: '【房车情况】', value: data.details.houseCar || '-' },
      ];

      listItems.forEach(item => {
        // 标签 (加粗) - 保持大小或微调
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#333333';
        ctx.fillText(item.label, labelX, currentY);

        // 值
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#000000';
        ctx.fillText(item.value, valueX, currentY);

        currentY += lineHeight;
      });

      // 3.3 详细介绍
      // currentY 约为 130 + 50*3 = 280
      currentY += 10; // 增加一点间距
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#333333';
      ctx.fillText('【详细介绍】', labelX, currentY);
      
      currentY += 35;
      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#555555';
      
      // 文本换行与截断处理
      const maxWidth = 400; // 480 - 80 padding
      // 空间计算: 480(底线) - 280(当前Y) = 200px 剩余高度
      // 行高 30px -> 约 6 行
      const maxLines = 6; 
      const textX = labelX; // 对齐
      
      const words = (data.introduction || '').split('');
      let line = '';
      let linesDrawn = 0;

      for (let i = 0; i < words.length; i++) {
        if (linesDrawn >= maxLines) break;
        
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
          // 这一行满了
          if (linesDrawn === maxLines - 1) {
             // 最后一行，需要截断加...
             line = line.substring(0, line.length - 1) + '...';
             ctx.fillText(line, textX, currentY);
             linesDrawn++;
             break;
          } else {
            ctx.fillText(line, textX, currentY);
            line = words[i];
            currentY += 30; // 行高
            linesDrawn++;
          }
        } else {
          line = testLine;
        }
      }
      // 绘制最后一行 (如果没有超限)
      if (linesDrawn < maxLines && line.length > 0) {
        ctx.fillText(line, textX, currentY);
      }
      ctx.restore();

      // ==========================================
      // 4. 右下：红娘区域 (480, 480, 480, 60)
      // ==========================================
      const footerX = 480;
      const footerY = 480;
      
      ctx.save();
      // 背景
      ctx.fillStyle = '#E6E6FA'; // Lavender (淡紫色)
      // 绘制带边框的圆角矩形
      const footerRectX = footerX + 20;
      const footerRectY = footerY + 10;
      const footerRectW = 440;
      const footerRectH = 40;
      
      ctx.roundRect(footerRectX, footerRectY, footerRectW, footerRectH, 20);
      ctx.fill();
      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 文字
      ctx.fillStyle = '#000000';
      ctx.font = '18px sans-serif'; // 调大字体
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const footerText = `${data.matchmaker.orgName} - ${data.matchmaker.name}`;
      ctx.fillText(footerText, footerRectX + footerRectW / 2, footerRectY + footerRectH / 2);
      ctx.restore();

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      reject(new Error('Failed to load base image'));
    };

    img.src = url;
  });
};
