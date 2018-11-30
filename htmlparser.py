#!/usr/bin/env python3

#import requests
from lxml import html
#import re
import argparse
from collections import deque

class Result:
    #def __init__(self, title, similarity, imgurl, content):
    #def __str___(self):


def parse_html(data):
    # base expression needed for all other expressions
    # represents the "result" div that contains all the information
    # to be extracted
    result_expr = '//div[@class="result"]'
    
    # base expression for the parent table
    result_table_expr = result_expr+'/table[@class="resulttable"]/tbody/tr'
    
    # 
    result_table_image_expr = result_table_expr+'/td[@class="resulttableimage"]'
    result_table_content_expr = result_table_expr+'/td[@class="resulttablecontent"]'
    result_content_expr = result_table_content_expr+'/div[@class="resultcontent"]'
    
    # expression used to extract similarity data
    similarity_expr = result_table_content_expr+'/div[@class="resultmatchinfo"]/div[@class="resultsimilarityinfo"]/text()'
    
    # expressions used to extract the title and the creator (if given)
    result_title_base_expr = result_content_expr+'/div[@class="resulttitle"]'
    result_title_expr = result_title_base_expr+'/strong/text()'
    result_title_text_expr = result_title_base_expr+'/text()'

    # expressions used to get the extra information
    result_content_column_expr = result_content_expr+'/div[@class="resultcontentcolumn"]'
    result_content_column_item_expr = result_content_column_expr+'/strong/text()'
    result_content_column_text_expr = result_content_column_expr+'/text()'
    result_content_column_link_expr = result_content_column_expr+'/a/@href'
    result_content_column_link_text_expr = result_content_column_expr+'/a/text()'

    tree = html.fromstring(data)
    results = tree.xpath(result_expr)
   
    # TODO: since, for whatever reason, only one result matters,
    # we can remove this loop
    for result in results:
        try:
            #print(result)
            #break
            results_ = []
            #print(result_title_expr)
            titles = result.xpath(result_title_expr)
            title_texts = result.xpath(result_title_text_expr)
            title_texts_q = deque(title_texts)
            
            for title in titles:
                if title == "Creator: ":
                    title_pair = [title, title_texts_q.pop()]
                    results_.append(title_pair)
                else:
                    results_.append(title)

            print(results_)
            break
        except IndexError:
            pass

with open('./results.html',"r") as f:
    data = f.read()
parse_html(data)

#print()
