#!/usr/bin/env python3
"""后处理 docx：表格边框 + 列表样式 + 紧凑排版"""

import sys
import zipfile
import shutil
import xml.etree.ElementTree as ET

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'


def fix_docx(filepath):
    """后处理 docx 文件"""
    tmp = filepath + '.tmp'

    with zipfile.ZipFile(filepath, 'r') as zin:
        with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)

                if item.filename == 'word/document.xml':
                    root = ET.fromstring(data)
                    fix_table_borders(root)
                    fix_list_styles(root)
                    fix_spacing(root)
                    data = ET.tostring(root, xml_declaration=True, encoding='UTF-8')
                elif item.filename == 'word/settings.xml':
                    # 不修改 settings.xml，避免破坏文档结构
                    pass

                zout.writestr(item, data)

    shutil.move(tmp, filepath)


def fix_table_borders(root):
    """为所有表格添加黑色边框"""
    for tbl in root.iter(f'{{{NS}}}tbl'):
        tblPr = tbl.find(f'{{{NS}}}tblPr')
        if tblPr is None:
            tblPr = ET.SubElement(tbl, f'{{{NS}}}tblPr')
            tbl.remove(tblPr)
            tbl.insert(0, tblPr)

        for old in tblPr.findall(f'{{{NS}}}tblBorders'):
            tblPr.remove(old)

        borders = ET.SubElement(tblPr, f'{{{NS}}}tblBorders')
        for edge in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
            el = ET.SubElement(borders, f'{{{NS}}}{edge}')
            el.set(f'{{{NS}}}val', 'single')
            el.set(f'{{{NS}}}sz', '12')
            el.set(f'{{{NS}}}space', '0')
            el.set(f'{{{NS}}}color', '000000')


def fix_list_styles(root):
    """将 Pandoc 的 Compact 样式列表转为带项目符号的列表"""
    for p in root.iter(f'{{{NS}}}p'):
        pPr = p.find(f'{{{NS}}}pPr')
        if pPr is None:
            continue

        pStyle = pPr.find(f'{{{NS}}}pStyle')
        if pStyle is not None:
            val = pStyle.get(f'{{{NS}}}val', '')
            if val == 'Compact':
                pStyle.set(f'{{{NS}}}val', 'ListBullet')
                numPr = pPr.find(f'{{{NS}}}numPr')
                if numPr is None:
                    numPr = ET.SubElement(pPr, f'{{{NS}}}numPr')
                    ilvl = ET.SubElement(numPr, f'{{{NS}}}ilvl')
                    ilvl.set(f'{{{NS}}}val', '0')
                    numId = ET.SubElement(numPr, f'{{{NS}}}numId')
                    numId.set(f'{{{NS}}}val', '1')


def fix_spacing(root):
    """调整段落间距和行距，使其更紧凑"""
    for p in root.iter(f'{{{NS}}}p'):
        pPr = p.find(f'{{{NS}}}pPr')
        if pPr is None:
            pPr = ET.SubElement(p, f'{{{NS}}}pPr')
            p.insert(0, pPr)

        # 获取或创建 spacing 元素
        spacing = pPr.find(f'{{{NS}}}spacing')
        if spacing is None:
            spacing = ET.SubElement(pPr, f'{{{NS}}}spacing')

        # 设置行距：276 = 1.15 倍行距（240 = 1.0）
        spacing.set(f'{{{NS}}}line', '276')
        spacing.set(f'{{{NS}}}lineRule', 'auto')

        # 获取样式名
        pStyle = pPr.find(f'{{{NS}}}pStyle')
        style_name = pStyle.get(f'{{{NS}}}val', '') if pStyle is not None else ''

        # 根据样式设置不同的段前段后间距
        if style_name.startswith('Heading1'):
            spacing.set(f'{{{NS}}}before', '160')   # 8pt
            spacing.set(f'{{{NS}}}after', '80')      # 4pt
        elif style_name.startswith('Heading2'):
            spacing.set(f'{{{NS}}}before', '120')   # 6pt
            spacing.set(f'{{{NS}}}after', '60')      # 3pt
        elif style_name.startswith('Heading3'):
            spacing.set(f'{{{NS}}}before', '80')    # 4pt
            spacing.set(f'{{{NS}}}after', '40')      # 2pt
        else:
            spacing.set(f'{{{NS}}}before', '0')     # 0pt
            spacing.set(f'{{{NS}}}after', '40')      # 2pt

    # 修复页面边距（在 sectPr 中设置）
    for sectPr in root.iter(f'{{{NS}}}sectPr'):
        pgMar = sectPr.find(f'{{{NS}}}pgMar')
        if pgMar is None:
            pgMar = ET.SubElement(sectPr, f'{{{NS}}}pgMar')

        # 1.5cm = 851 twips (1cm = 567 twips)
        margin = '851'
        pgMar.set(f'{{{NS}}}top', margin)
        pgMar.set(f'{{{NS}}}bottom', margin)
        pgMar.set(f'{{{NS}}}left', margin)
        pgMar.set(f'{{{NS}}}right', margin)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('用法: python3 fix-tables.py <file.docx>')
        sys.exit(1)
    fix_docx(sys.argv[1])
